import { c as m, s as g, e as F, f as E } from "./filesystem-C1g2j6Bt.js";
importScripts("browserfs.min.js");
function c(i) {
  self.postMessage(i);
}
self.addEventListener("message", async (i) => {
  console.log("OpenSCAD worker received message:", i.data);
  const {
    mountArchives: h,
    inputs: l,
    args: p,
    outputPaths: f
  } = i.data, n = [];
  let o;
  const d = performance.now();
  try {
    if (console.log("Initializing OpenSCAD..."), o = await OpenSCAD({
      noInitialRun: !0,
      print: (e) => {
        console.debug("stdout: " + e), c({ stdout: e }), n.push({ stdout: e });
      },
      printErr: (e) => {
        console.debug("stderr: " + e), c({ stderr: e }), n.push({ stderr: e });
      }
    }), console.log("OpenSCAD instance created."), h) {
      console.log("Mounting archives..."), await m({ prefix: "", allowPersistence: !1 }), o.FS.mkdir("/libraries");
      const e = new BrowserFS.EmscriptenFS(
        o.FS,
        o.PATH ?? {
          join2: (r, w) => `${r}/${w}`,
          join: (...r) => r.join("/")
        },
        o.ERRNO_CODES ?? {}
      );
      o.FS.mount(e, { root: "/" }, "/libraries"), await g(F, o.FS, "/libraries", "/"), console.log("Archives mounted.");
    }
    if (o.FS.chdir("/"), o.FS.mkdir("/locale"), l)
      for (const e of l)
        try {
          console.log(`Writing ${e.path}`), e.content == null && e.path != null && e.url == null ? o.FS.isFile(e.path) || console.error(`File ${e.path} does not exist!`) : o.FS.writeFile(e.path, await E(o.FS, e));
        } catch (r) {
          throw console.trace(r), new Error(`Error while trying to write ${e.path}: ${r}`);
        }
    console.log("Invoking OpenSCAD with: ", p);
    let t;
    try {
      t = o.callMain(p);
    } catch (e) {
      throw typeof e == "number" && o.formatException && (e = o.formatException(e)), new Error(`OpenSCAD invocation failed: ${e}`);
    }
    const a = performance.now() - d, s = [];
    for (const e of f ?? [])
      try {
        const r = o.FS.readFile(e);
        s.push([e, r]);
      } catch (r) {
        throw console.trace(r), new Error(`Failed to read output file ${e}: ${r}`);
      }
    const u = {
      outputs: s,
      mergedOutputs: n,
      exitCode: t,
      elapsedMillis: a
    };
    console.debug(u), c({ result: u });
  } catch (t) {
    console.error("Error in OpenSCAD worker:", t);
    const a = performance.now() - d;
    console.trace(t);
    const s = `${t}`;
    n.push({ error: s }), c({
      result: {
        exitCode: void 0,
        error: s,
        mergedOutputs: n,
        elapsedMillis: a
      }
    });
  }
});
//# sourceMappingURL=openscad-worker.js.map
