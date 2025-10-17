// OpenSCAD Worker - ES Module
// This file is intentionally an ES module to support import.meta in dependencies

console.log("OpenSCAD worker loading (ES module mode)");

// Initialize the worker
let initialized = false;
let OpenSCAD;
let createEditorFS, symlinkLibraries, deployedArchiveNames, fetchSource;

async function initialize() {
  if (initialized) return;
  
  try {
    console.log("Loading BrowserFS...");
    // Load BrowserFS first (it expects to be global)
    const browserFSCode = await fetch('/browserfs.min.js').then(r => r.text());
    // Execute the code to make BrowserFS available globally
    // Use Function constructor to execute in global scope with proper 'this' binding
    const fn = new Function(browserFSCode);
    fn.call(self);
    console.log("BrowserFS loaded:", typeof self.BrowserFS);
    
    console.log("Loading OpenSCAD WASM module...");
    // Dynamically import OpenSCAD WASM module (uses import.meta)
    const openscadModule = await import("/wasm/openscad.js");
    // The OpenSCAD function is exported or made global by the module
    OpenSCAD = self.OpenSCAD;
    console.log("OpenSCAD WASM module loaded");
    
    // Load our ES modules
    console.log("Loading filesystem modules...");
    const fsModule = await import("/src/fs/filesystem");
    createEditorFS = fsModule.createEditorFS;
    symlinkLibraries = fsModule.symlinkLibraries;
    
    const zipModule = await import("/src/fs/zip-archives");
    deployedArchiveNames = zipModule.deployedArchiveNames;
    
    const utilsModule = await import("/src/utils");
    fetchSource = utilsModule.fetchSource;
    
    initialized = true;
    console.log("OpenSCAD worker fully initialized");
  } catch (err) {
    console.error("Failed to initialize worker:", err);
    throw err;
  }
}

self.addEventListener('message', async (e) => {
  console.log('OpenSCAD worker received message:', e.data);
  
  const { mountArchives, inputs, args, outputPaths, config } = e.data;
  const mergedOutputs = [];
  const start = performance.now();
  
  try {
    // Initialize on first message
    await initialize();
    
    console.log('Initializing OpenSCAD...');
    const instance = await OpenSCAD({
      noInitialRun: true,
      'print': (text) => {
        console.debug('stdout: ' + text);
        self.postMessage({ stdout: text });
        mergedOutputs.push({ stdout: text });
      },
      'printErr': (text) => {
        console.debug('stderr: ' + text);
        self.postMessage({ stderr: text });
        mergedOutputs.push({ stderr: text });
      },
    });
    console.log('OpenSCAD instance created.');

    if (mountArchives) {
      console.log('Mounting archives...');
      await createEditorFS({ prefix: '', allowPersistence: false });
      
      instance.FS.mkdir('/libraries');
      
      const BFS = new BrowserFS.EmscriptenFS(
        instance.FS,
        instance.PATH ?? {
          join2: (a, b) => `${a}/${b}`,
          join: (...args) => args.join('/'),
        },
        instance.ERRNO_CODES ?? {}
      );
        
      instance.FS.mount(BFS, { root: '/' }, '/libraries');
      await symlinkLibraries(deployedArchiveNames, instance.FS, '/libraries', "/");
      console.log('Archives mounted.');
    }

    instance.FS.chdir("/");
    instance.FS.mkdir('/locale');

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

    console.log('Invoking OpenSCAD with: ', args);
    let exitCode;
    try {
      exitCode = instance.callMain(args);
    } catch (e) {
      if (typeof e === "number" && instance.formatException) {
        e = instance.formatException(e);
      }
      throw new Error(`OpenSCAD invocation failed: ${e}`);
    }
    
    const end = performance.now();
    const elapsedMillis = end - start;

    const outputs = [];
    for (const path of (outputPaths ?? [])) {
      try {
        const content = instance.FS.readFile(path);
        outputs.push([path, content]);
      } catch (e) {
        console.trace(e);
        throw new Error(`Failed to read output file ${path}: ${e}`);
      }
    }
    
    const result = {
      outputs,
      mergedOutputs,
      exitCode,
      elapsedMillis,
    };

    console.debug(result);
    self.postMessage({ result });
    
  } catch (e) {
    console.error('Error in OpenSCAD worker:', e);
    const end = performance.now();
    const elapsedMillis = end - start;

    console.trace(e);
    const error = `${e}`;
    mergedOutputs.push({ error });
    self.postMessage({
      result: {
        exitCode: undefined,
        error,
        mergedOutputs,
        elapsedMillis,
      }
    });
  }
});
