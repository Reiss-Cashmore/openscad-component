import { c as m, s as F, e as g, f as E } from "./filesystem-CLkvj-ck.js";
importScripts("browserfs.min.js");
function i(a) {
  self.postMessage(a);
}
self.addEventListener("message", async (a) => {
  const {
    mountArchives: f,
    inputs: l,
    args: p,
    outputPaths: h
  } = a.data, r = [];
  let t;
  const d = performance.now();
  try {
    if (t = await OpenSCAD({
      noInitialRun: !0,
      print: (e) => {
        console.debug("stdout: " + e), i({ stdout: e }), r.push({ stdout: e });
      },
      printErr: (e) => {
        console.debug("stderr: " + e), i({ stderr: e }), r.push({ stderr: e });
      }
    }), f) {
      await m({ prefix: "", allowPersistence: !1 }), t.FS.mkdir("/libraries");
      const e = new BrowserFS.EmscriptenFS(
        t.FS,
        t.PATH ?? {
          join2: (o, S) => `${o}/${S}`,
          join: (...o) => o.join("/")
        },
        t.ERRNO_CODES ?? {}
      );
      t.FS.mount(e, { root: "/" }, "/libraries"), await F(g, t.FS, "/libraries", "/");
    }
    if (t.FS.chdir("/"), t.FS.mkdir("/locale"), l)
      for (const e of l)
        try {
          console.log(`Writing ${e.path}`), e.content == null && e.path != null && e.url == null ? t.FS.isFile(e.path) || console.error(`File ${e.path} does not exist!`) : t.FS.writeFile(e.path, await E(t.FS, e));
        } catch (o) {
          throw console.trace(o), new Error(`Error while trying to write ${e.path}: ${o}`);
        }
    console.log("Invoking OpenSCAD with: ", p);
    let s;
    try {
      s = t.callMain(p);
    } catch (e) {
      throw typeof e == "number" && t.formatException && (e = t.formatException(e)), new Error(`OpenSCAD invocation failed: ${e}`);
    }
    const c = performance.now() - d, n = [];
    for (const e of h ?? [])
      try {
        const o = t.FS.readFile(e);
        n.push([e, o]);
      } catch (o) {
        throw console.trace(o), new Error(`Failed to read output file ${e}: ${o}`);
      }
    const u = {
      outputs: n,
      mergedOutputs: r,
      exitCode: s,
      elapsedMillis: c
    };
    console.debug(u), i({ result: u });
  } catch (s) {
    const c = performance.now() - d;
    console.trace(s);
    const n = `${s}`;
    r.push({ error: n }), i({
      result: {
        exitCode: void 0,
        error: n,
        mergedOutputs: r,
        elapsedMillis: c
      }
    });
  }
});
//# sourceMappingURL=openscad-worker.js.map
