// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import { AbortablePromise } from "../utils.ts";
import { Source } from "../state/app-state.ts";
import OpenSCADWorker from "./openscad-worker.ts?worker";

export type MergedOutputs = {stdout?: string, stderr?: string, error?: string}[];

export type OpenSCADWorkerConfig = {
  wasmUrl?: string;
  wasmJsUrl?: string;
};

export type OpenSCADInvocation = {
  mountArchives: boolean;
  inputs?: Source[];
  args: string[];
  outputPaths?: string[];
  config?: OpenSCADWorkerConfig;
};

export type OpenSCADInvocationResults = {
  exitCode?: number,
  error?: string,
  outputs?: [string, string][],
  mergedOutputs: MergedOutputs,
  elapsedMillis: number,
};

export type ProcessStreams = {stderr: string} | {stdout: string}
export type OpenSCADInvocationCallback = {result: OpenSCADInvocationResults} | ProcessStreams;

export function spawnOpenSCAD(
  invocation: OpenSCADInvocation,
  streamsCallback: (ps: ProcessStreams) => void
): AbortablePromise<OpenSCADInvocationResults> {
  let worker: Worker | null;
  let rejection: (err: any) => void;

  function terminate() {
    if (!worker) {
      return;
    }
    worker.terminate();
    worker = null;
  }
    
  return AbortablePromise<OpenSCADInvocationResults>((resolve: (result: OpenSCADInvocationResults) => void, reject: (error: any) => void) => {
    // Use Vite's worker import (processes TypeScript and handles modules correctly)
    const workerInstance = new OpenSCADWorker();
    worker = workerInstance;
    rejection = reject;
    workerInstance.onmessage = (e: MessageEvent<OpenSCADInvocationCallback>) => {
      if ('result' in e.data) {
        resolve(e.data.result);
        terminate();
      } else {
        streamsCallback(e.data);
      }
    }
    const globalConfig =
      (globalThis as any).__OpenSCADWorkerConfig ?? {};

    const config: OpenSCADWorkerConfig = {
      wasmUrl: globalConfig.wasmUrl ?? invocation.config?.wasmUrl,
      wasmJsUrl:
        globalConfig.wasmJsUrl ??
        invocation.config?.wasmJsUrl ??
        (globalConfig.wasmUrl
          ? globalConfig.wasmUrl.replace(/\.wasm(\?.*)?$/, ".js$1")
          : undefined),
    };

    workerInstance.postMessage({
      ...invocation,
      config,
    });

    return () => {
      terminate();
    };
  });
}
