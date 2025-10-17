// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

// Inline type definitions to avoid any imports that would make this an ES module
export type MergedOutputs = {stdout?: string, stderr?: string, error?: string}[];

type Source = {
  path: string;
  content?: string;
  url?: string;
};

type OpenSCADWorkerConfig = {
  wasmUrl?: string;
  wasmJsUrl?: string;
};

type OpenSCADInvocation = {
  mountArchives: boolean;
  inputs?: Source[];
  args: string[];
  outputPaths?: string[];
  config?: OpenSCADWorkerConfig;
};

type OpenSCADInvocationResults = {
  exitCode?: number;
  error?: string;
  outputs?: [string, string][];
  mergedOutputs: MergedOutputs;
  elapsedMillis: number;
};

type ProcessStreams = {stderr: string} | {stdout: string};
type OpenSCADInvocationCallback = {result: OpenSCADInvocationResults} | ProcessStreams;

// Dynamically import dependencies to avoid bundling issues
let depsLoaded = false;
let BrowserFS: any;
let OpenSCAD: any;
let createEditorFS: any;
let symlinkLibraries: any;
let deployedArchiveNames: any;
let fetchSource: any;

async function loadDependencies() {
  if (depsLoaded) return;
  
  // Load BrowserFS first (it expects to be global)
  console.log("Loading BrowserFS...");
  const browserFSCode = await fetch('/browserfs.min.js').then(r => r.text());
  // Use indirect eval to execute in global scope (0, eval)('code') executes in global scope
  (0, eval)(browserFSCode);
  // Ensure BrowserFS is available
  BrowserFS = (self as any).BrowserFS || (globalThis as any).BrowserFS;
  if (!BrowserFS) {
    throw new Error('BrowserFS failed to load');
  }
  console.log("BrowserFS loaded:", typeof BrowserFS);
  
  // Load OpenSCAD WASM loader (uses import.meta, so must be imported as module)
  // We can't use static import from /public in Vite, so we create a blob URL module
  console.log("Loading OpenSCAD WASM module...");
  let openscadJsCode = await fetch('/wasm/openscad.js').then(r => r.text());
  // Replace import.meta.url with the actual URL so it can find the WASM file
  // The openscad.js uses import.meta.url to determine where to load the WASM from
  const actualWasmBaseUrl = new URL('/wasm/', self.location.href).href;
  openscadJsCode = openscadJsCode.replace(/import\.meta\.url/g, JSON.stringify(actualWasmBaseUrl + 'openscad.js'));
  const openscadBlob = new Blob([openscadJsCode], { type: 'application/javascript' });
  const openscadBlobUrl = URL.createObjectURL(openscadBlob);
  const openscadModule = await import(/* @vite-ignore */ openscadBlobUrl);
  URL.revokeObjectURL(openscadBlobUrl);
  // Assign OpenSCAD from the module (check both default export and named export)
  OpenSCAD = openscadModule.default || openscadModule.OpenSCAD || (self as any).OpenSCAD;
  console.log("OpenSCAD WASM module loaded:", typeof OpenSCAD);
  
  // Now dynamically import our ES modules
  console.log("Loading filesystem modules...");
  const fsModule = await import("../fs/filesystem");
  createEditorFS = fsModule.createEditorFS;
  symlinkLibraries = fsModule.symlinkLibraries;
  
  const zipModule = await import("../fs/zip-archives");
  deployedArchiveNames = zipModule.deployedArchiveNames;
  
  const utilsModule = await import("../utils");
  fetchSource = utilsModule.fetchSource;
  
  depsLoaded = true;
  console.log("All dependencies loaded");
}

function callback(payload: OpenSCADInvocationCallback) {
  self.postMessage(payload);
}

self.addEventListener('message', async (e: MessageEvent<OpenSCADInvocation>) => {
  console.log('OpenSCAD worker received message:', e.data);
  
  // Load dependencies first
  try {
    await loadDependencies();
  } catch (err) {
    console.error('Failed to load dependencies:', err);
    callback({
      result: {
        exitCode: undefined,
        error: `Failed to load dependencies: ${err}`,
        mergedOutputs: [{ error: `Failed to load dependencies: ${err}` }],
        elapsedMillis: 0,
      }
    });
    return;
  }
  const {
    mountArchives,
    inputs,
    args,
    outputPaths,
  } = e.data;

  const mergedOutputs: MergedOutputs = [];
  let instance: any;
  const start = performance.now();
  try {
    console.log('Initializing OpenSCAD...');
    instance = await OpenSCAD({
      noInitialRun: true,
      'print': (text: string) => {
        console.debug('stdout: ' + text);
        callback({stdout: text})
        mergedOutputs.push({ stdout: text })
      },
      'printErr': (text: string) => {
        console.debug('stderr: ' + text);
        callback({stderr: text})
        mergedOutputs.push({ stderr: text })
      },
    });
    console.log('OpenSCAD instance created.');

    if (mountArchives) {
      console.log('Mounting archives...');
      // This will mount lots of libraries' ZIP archives under /libraries/<name> -> <name>.zip
      await createEditorFS({prefix: '', allowPersistence: false});
      
      instance.FS.mkdir('/libraries');
      
      // https://github.com/emscripten-core/emscripten/issues/10061
      const BFS = new BrowserFS.EmscriptenFS(
        instance.FS,
        instance.PATH ?? {
          join2: (a: string, b: string) => `${a}/${b}`,
          join: (...args: string[]) => args.join('/'),
        },
        instance.ERRNO_CODES ?? {}
      );
        
      instance.FS.mount(BFS, {root: '/'}, '/libraries');

      await symlinkLibraries(deployedArchiveNames, instance.FS, '/libraries', "/");
      console.log('Archives mounted.');
    }

    // Fonts are seemingly resolved from $(cwd)/fonts
    instance.FS.chdir("/");

    instance.FS.mkdir('/locale');
      
    // const walkFolder = (path: string, indent = '') => {
    //   console.log("Walking " + path);
    //   instance.FS.readdir(path)?.forEach((f: string) => {
    //     if (f.startsWith('.')) {
    //       return;
    //     }
    //     const ii = indent + '  ';
    //     const p = `${path != '/' ? path + '/' : '/'}${f}`;
    //     console.log(`${ii}${p}`);
    //     walkFolder(p, ii);
    //   });
    // };
    // walkFolder('/libraries');

    if (inputs) {
      for (const source of inputs) {
        try {
          console.log(`Writing ${source.path}`);
          if (source.content == null && source.path != null && source.url == null) {
            if (!instance.FS.isFile(source.path)) {
              console.error(`File ${source.path} does not exist!`);
            }
          } else {
            instance.FS.writeFile(source.path, await fetchSource(instance.FS, source));
          }
        } catch (e) {
          console.trace(e);
          throw new Error(`Error while trying to write ${source.path}: ${e}`);
        }
      }
    }

    console.log('Invoking OpenSCAD with: ', args)
    let exitCode;
    try {
      exitCode = instance.callMain(args);
    } catch(e){
      if(typeof e === "number" && instance.formatException){
        // The number was a raw C++ exception
        // See https://github.com/emscripten-core/emscripten/pull/16343
        e = instance.formatException(e);
      }
      throw new Error(`OpenSCAD invocation failed: ${e}`);
    }
    const end = performance.now();
    const elapsedMillis = end - start;

    const outputs: [string, string][] = [];
    for (const path of (outputPaths ?? [])) {
      try {
        const content = instance.FS.readFile(path);
        outputs.push([path, content]);
      } catch (e) {
        console.trace(e);
        throw new Error(`Failed to read output file ${path}: ${e}`);
      }
    }
    const result: OpenSCADInvocationResults = {
      outputs,
      mergedOutputs,
      exitCode,
      elapsedMillis,
    }

    console.debug(result);
    callback({result});
  } catch (e) {
    console.error('Error in OpenSCAD worker:', e);
    const end = performance.now();
    const elapsedMillis = end - start;

    console.trace(e);
    const error = `${e}`;
    mergedOutputs.push({ error });
    callback({
      result: {
        exitCode: undefined,
        error,
        mergedOutputs,
        elapsedMillis,
      }
    });
  }
});
