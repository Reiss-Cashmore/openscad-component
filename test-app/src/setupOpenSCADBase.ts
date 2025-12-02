declare global {
  // eslint-disable-next-line no-var
  var __OPENSCAD_BASE_URL__: string | undefined;
}

const base = import.meta.env.BASE_URL ?? '/';

if (typeof globalThis === 'object' && globalThis) {
  (globalThis as typeof globalThis & { __OPENSCAD_BASE_URL__?: string }).__OPENSCAD_BASE_URL__ = base;
}

export {};

