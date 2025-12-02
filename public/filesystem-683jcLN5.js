function B(e, t, i) {
  const r = [];
  for (const o of Object.keys(e))
    i && !i(o) || r.push(t(o, e[o]));
  return r;
}
function m(e) {
  let t;
  const i = new Promise((r, o) => {
    t = e(r, o);
  });
  return Object.assign(i, { kill: t });
}
function L(e, t) {
  let i, r;
  return (...o) => ({ now: n }) => m((s, a) => {
    let c;
    return (async () => {
      const l = async () => {
        r && (r(), r = null), c = t(...o), r = c.kill;
        try {
          s(await c);
        } catch (u) {
          a(u);
        } finally {
          r = null;
        }
      };
      i && (clearTimeout(i), i = null), n ? l() : i = window.setTimeout(l, e);
    })(), () => c?.kill();
  });
}
function U(e) {
  return e < 1024 ? `${Math.floor(e)} bytes` : (e /= 1024, e < 1024 ? `${Math.floor(e * 10) / 10} kB` : (e /= 1024, `${Math.floor(e * 10) / 10} MB`));
}
function _(e) {
  return e < 1e3 ? `${Math.floor(e)}ms` : `${Math.floor(e / 100) / 10}sec`;
}
function $() {
  const e = () => {
    document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
  };
  window.addEventListener("resize", e), e();
}
function I() {
  return !!("standalone" in window.navigator && window.navigator.standalone);
}
function N(e, t) {
  const i = document.createElement("a");
  i.href = e, i.setAttribute("download", t), document.body.appendChild(i), i.click(), i.parentNode?.removeChild(i);
}
async function k(e, { content: t, path: i, url: r }) {
  const o = i.endsWith(".scad") || i.endsWith(".json");
  if (t)
    return new TextEncoder().encode(t);
  if (r) {
    if (o)
      return t = await (await fetch(r)).text(), new TextEncoder().encode(t.replace(/\r\n/g, `
`));
    {
      const s = await (await fetch(r)).arrayBuffer();
      return new Uint8Array(s);
    }
  } else if (i) {
    const n = e.readFileSync(i);
    return new Uint8Array("buffer" in n ? n.buffer : n);
  } else
    throw new Error("Invalid source: " + JSON.stringify({ path: i, content: t, url: r }));
}
function v(e) {
  return new Promise((t, i) => {
    const r = new FileReader();
    r.onloadend = () => {
      t(r.result);
    }, r.onerror = i, r.readAsDataURL(e);
  });
}
const d = {
  fonts: {},
  openscad: {
    description: "OpenSCAD",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/openscad/openscad",
      include: [{ glob: ["examples/*.scad", "LICENSE"] }]
    },
    docs: {
      CheatSheet: "https://openscad.org/cheatsheet/index.html",
      Documentation: "https://openscad.org/documentation.html"
    }
  },
  MCAD: {
    description: "OpenSCAD Parametric CAD Library",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/openscad/MCAD",
      include: [{ glob: ["*.scad", "bitmap/*.scad", "LICENSE"] }]
    }
  },
  BOSL: {
    description: "The Belfry OpenScad Library",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/revarbat/BOSL",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    }
  },
  BOSL2: {
    description: "The Belfry OpenScad Library, v2.0",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/BelfrySCAD/BOSL2",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    },
    docs: {
      CheatSheet: "https://github.com/BelfrySCAD/BOSL2/wiki/CheatSheet",
      Wiki: "https://github.com/BelfrySCAD/BOSL2/wiki"
    }
  },
  NopSCADlib: {
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/nophead/NopSCADlib",
      include: [{
        glob: "**/*.scad",
        ignore: "test/**"
      }]
    }
  },
  boltsparts: {
    description: "OpenSCAD library for generating bolt/nut models",
    gitOrigin: {
      branch: "main",
      repoUrl: "https://github.com/boltsparts/boltsparts",
      include: [{
        glob: "openscad/**/*.scad",
        ignore: "test/**"
      }]
    },
    docs: {
      Usage: "https://boltsparts.github.io/en/docs/0.3/document/openscad/usage.html"
    }
  },
  brailleSCAD: {
    gitOrigin: {
      branch: "main",
      repoUrl: "https://github.com/BelfrySCAD/brailleSCAD",
      include: [{
        glob: ["**/*.scad", "LICENSE"],
        ignore: "test/**"
      }]
    },
    docs: {
      Documentation: "https://github.com/BelfrySCAD/brailleSCAD/wiki/TOC"
    }
  },
  FunctionalOpenSCAD: {
    description: "Implementing OpenSCAD in OpenSCAD",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/thehans/FunctionalOpenSCAD",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    }
  },
  "OpenSCAD-Snippet": {
    description: "OpenSCAD Snippet Library",
    gitOrigin: {
      branch: "main",
      repoUrl: "https://github.com/AngeloNicoli/OpenSCAD-Snippet",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    },
    symlinks: {
      Asset_SCAD: "Asset_SCAD",
      "Import_Library.scad": "Import_Library.scad"
    }
  },
  funcutils: {
    description: "OpenSCAD collection of functional programming utilities, making use of function-literals.",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/thehans/funcutils",
      include: [{ glob: "**/*.scad" }]
    }
  },
  "smooth-prim": {
    description: "OpenSCAD smooth primitives library",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/rcolyer/smooth-prim",
      include: [{ glob: ["**/*.scad", "LICENSE.txt"] }]
    },
    symlinks: { "smooth_prim.scad": "smooth_prim.scad" }
  },
  closepoints: {
    description: "OpenSCAD ClosePoints Library",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/rcolyer/closepoints",
      include: [{ glob: ["**/*.scad", "LICENSE.txt"] }]
    },
    symlinks: { "closepoints.scad": "closepoints.scad" }
  },
  "plot-function": {
    description: "OpenSCAD Function Plotting Library",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/colyer/plot-function",
      include: [{ glob: ["**/*.scad", "LICENSE.txt"] }]
    },
    symlinks: { "plot_function.scad": "plot_function.scad" }
  },
  // 'threads': {
  //   deployed: false,
  //   gitOrigin: {
  //     branch: 'master',
  //     repoUrl: 'https://github.com/colyer/threads',
  //     include: [{glob: ['**/*.scad', 'LICENSE.txt']}],
  //   },
  // },
  "openscad-tray": {
    description: "OpenSCAD library to create rounded rectangular trays with optional subdividers.",
    gitOrigin: {
      branch: "main",
      repoUrl: "https://github.com/sofian/openscad-tray",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    },
    symlinks: { "tray.scad": "tray.scad" }
  },
  lasercut: {
    description: "Module for OpenSCAD, allowing 3D models to be created from 2D lasercut parts.",
    gitOrigin: {
      branch: "master",
      repoUrl: "https://github.com/bmsleight/lasercut",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    },
    symlinks: { "lasercut.scad": "lasercut.scad" }
  },
  YAPP_Box: {
    description: "Yet Another Parametric Projectbox Box",
    gitOrigin: {
      branch: "main",
      repoUrl: "https://github.com/mrWheel/YAPP_Box",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    }
  },
  Stemfie_OpenSCAD: {
    description: "OpenSCAD Stemfie Library",
    gitOrigin: {
      branch: "main",
      repoUrl: "https://github.com/Cantareus/Stemfie_OpenSCAD",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    }
  },
  "UB.scad": {
    gitOrigin: {
      branch: "main",
      repoUrl: "https://github.com/UBaer21/UB.scad",
      include: [{ glob: ["libraries/*.scad", "LICENSE", "examples/UBexamples/*.scad"], replacePrefix: {
        "libraries/": "",
        "examples/UBexamples/": "examples/"
      } }]
    },
    symlinks: { "ub.scad": "libraries/ub.scad" }
    // TODO change this after the replaces work
  },
  pathbuilder: {
    gitOrigin: {
      branch: "main",
      repoUrl: "https://github.com/dinther/pathbuilder.git",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    }
  },
  openscad_attachable_text3d: {
    gitOrigin: {
      branch: "main",
      repoUrl: "https://github.com/jon-gilbert/openscad_attachable_text3d.git",
      include: [{ glob: ["**/*.scad", "LICENSE"] }]
    }
  }
}, p = Object.entries(d).filter(([e, { deployed: t }]) => t == null || t).map(([e]) => e), b = {};
function g() {
  if (typeof globalThis == "object" && globalThis) {
    const e = globalThis.__OPENSCAD_BASE_URL__;
    if (typeof e == "string" && e.length > 0)
      return e;
  }
}
function f() {
  if (typeof import.meta < "u" && b)
    return "/";
}
function S() {
  if (typeof document > "u")
    return;
  const t = document.querySelector("base")?.getAttribute("href");
  if (t && t.length > 0)
    return t;
}
function y() {
  return g() ?? f() ?? S() ?? "/";
}
function C(e) {
  return e.endsWith("/") ? e.slice(0, -1) : e;
}
function h(e) {
  return e.startsWith("/") ? e.slice(1) : e;
}
function A(e) {
  const t = y();
  if (!e) return t;
  const i = t === "/" ? "" : C(t), r = h(e);
  return `${i}/${r}`;
}
function O(e) {
  return A(`libraries/${h(e)}`);
}
const P = (e) => {
  let t = e.split("/").slice(0, -1).join("/");
  return t === "" ? e.startsWith("/") ? "/" : "." : t;
};
function w(e, t) {
  return e === "." ? t : e.endsWith("/") ? w(e.substring(0, e.length - 1), t) : t === "." ? e : `${e}/${t}`;
}
async function E(e) {
  const t = BrowserFS.BFSRequire("buffer").Buffer, i = async (n) => (await fetch(n)).arrayBuffer(), r = await Promise.all(
    e.map(async (n) => [n, await i(O(`${n}.zip`))])
  ), o = {};
  for (const [n, s] of r)
    o[n] = {
      fs: "ZipFS",
      options: {
        zipData: t.from(s)
      }
    };
  return o;
}
async function x(e, t, i = "/libraries", r = "/tmp") {
  const o = async (n, s) => {
    try {
      await t.symlink(n, s);
    } catch (a) {
      console.error(`symlink(${n}, ${s}) failed: `, a);
    }
  };
  await Promise.all(e.map((n) => (async () => {
    if (!(n in d)) throw new Error(`Archive named ${n} invalid (valid ones: ${p.join(", ")})`);
    const { symlinks: s } = d[n];
    if (s)
      for (const a in s) {
        const c = s[a], l = c === "." ? `${i}/${n}` : `${i}/${n}/${c}`, u = a.startsWith("/") ? a : `${r}/${a}`;
        await o(l, u);
      }
    else
      await o(`${i}/${n}`, `${r}/${n}`);
  })()));
}
function D(e, t) {
  return new Promise(async (i, r) => {
    BrowserFS.install(e);
    try {
      BrowserFS.configure(t, function(o) {
        o ? r(o) : i(null);
      });
    } catch (o) {
      console.error(o), r(o);
    }
  });
}
async function F({ prefix: e, allowPersistence: t }) {
  const r = await E(p), o = {};
  for (const s in r)
    o[`${e}${s}`] = r[s];
  await D(typeof window == "object" && window || self, {
    fs: "OverlayFS",
    options: {
      readable: {
        fs: "MountableFileSystem",
        options: {
          ...o
        }
      },
      writable: {
        fs: "InMemory"
      }
    }
  });
  var n = BrowserFS.BFSRequire("fs");
  return n;
}
export {
  m as A,
  U as a,
  _ as b,
  $ as c,
  N as d,
  F as e,
  k as f,
  P as g,
  p as h,
  I as i,
  w as j,
  B as m,
  v as r,
  x as s,
  L as t,
  d as z
};
//# sourceMappingURL=filesystem-683jcLN5.js.map
