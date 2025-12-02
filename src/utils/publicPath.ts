type GlobalWithBase = typeof globalThis & {
  __OPENSCAD_BASE_URL__?: string;
};

function getGlobalBase(): string | undefined {
  if (typeof globalThis === 'object' && globalThis) {
    const maybeBase = (globalThis as GlobalWithBase).__OPENSCAD_BASE_URL__;
    if (typeof maybeBase === 'string' && maybeBase.length > 0) {
      return maybeBase;
    }
  }
  return undefined;
}

function getImportMetaBase(): string | undefined {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const base = (import.meta as any).env.BASE_URL;
    if (typeof base === 'string' && base.length > 0) {
      return base;
    }
  }
  return undefined;
}

function getDocumentBase(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }
  const baseElement = document.querySelector('base');
  const href = baseElement?.getAttribute('href');
  if (href && href.length > 0) {
    return href;
  }
  return undefined;
}

// For web worker context - derive base URL from worker's own location
function getWorkerBase(): string | undefined {
  // Check if we're in a worker context (no document, but self.location exists)
  if (typeof document === 'undefined' && typeof self !== 'undefined' && self.location) {
    const workerUrl = new URL(self.location.href);
    let basePath = workerUrl.pathname.replace(/\/[^/]*$/, '/'); // Remove filename
    basePath = basePath.replace(/\/assets\/$/, '/'); // Remove /assets/ if present
    return `${workerUrl.origin}${basePath}`;
  }
  return undefined;
}

function resolveBaseUrl(): string {
  return getGlobalBase() ?? getImportMetaBase() ?? getWorkerBase() ?? getDocumentBase() ?? '/';
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function trimLeadingSlash(value: string): string {
  return value.startsWith('/') ? value.slice(1) : value;
}

export function resolvePublicPath(path: string): string {
  const baseUrl = resolveBaseUrl();
  if (!path) return baseUrl;
  
  const normalizedPath = trimLeadingSlash(path);
  
  // If baseUrl is a full URL (from worker context), use URL constructor
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return new URL(normalizedPath, baseUrl).toString();
  }
  
  // Otherwise, simple string concatenation for path-based bases
  const normalizedBase = baseUrl === '/' ? '' : trimTrailingSlash(baseUrl);
  return `${normalizedBase}/${normalizedPath}`;
}

export function resolveLibrariesAsset(path: string): string {
  return resolvePublicPath(`libraries/${trimLeadingSlash(path)}`);
}

