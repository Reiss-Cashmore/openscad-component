declare global {
  // eslint-disable-next-line no-var
  var __OPENSCAD_BASE_URL__: string | undefined;
}

const base = import.meta.env.BASE_URL ?? '/';

if (typeof globalThis === 'object' && globalThis) {
  (globalThis as typeof globalThis & { __OPENSCAD_BASE_URL__?: string }).__OPENSCAD_BASE_URL__ = base;
}

function normalizeBase(value: string): string {
  if (!value.endsWith('/')) {
    return `${value}/`;
  }
  return value;
}

function resolvePublicAsset(path: string): string {
  const normalizedBase = normalizeBase(base);
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}${normalizedBase}${normalizedPath}`.replace(/([^:]\/)\/+/g, '$1');
  }
  return `${normalizedBase}${normalizedPath}`.replace(/\/\/+/g, '/');
}

function loadScript(path: string, options?: { type?: 'module' | 'text/javascript' }): Promise<void> {
  const scriptType = options?.type ?? 'text/javascript';
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[data-openscad-ext="${path}"]`);
    if (existing && existing.dataset.loaded === 'true') {
      resolve();
      return;
    }

    const script = existing ?? document.createElement('script');
    script.dataset.openscadExt = path;
    script.src = resolvePublicAsset(path);
    script.type = scriptType;
    script.async = false;
    script.dataset.loaded = 'false';

    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });

    script.addEventListener('error', (event) => {
      reject(new Error(`Failed to load script ${script.src}: ${event}`));
    });

    if (!existing) {
      document.head.appendChild(script);
    }
  });
}

let externalsPromise: Promise<void> | null = null;

export function ensureOpenSCADExternalsReady(): Promise<void> {
  if (!externalsPromise) {
    externalsPromise = loadScript('browserfs.min.js').then(() =>
      loadScript('model-viewer.min.js', { type: 'module' })
    );
  }
  return externalsPromise;
}

