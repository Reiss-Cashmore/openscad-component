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

function resolveBaseUrl(): string {
  return getGlobalBase() ?? getImportMetaBase() ?? getDocumentBase() ?? '/';
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
  const normalizedBase = baseUrl === '/' ? '' : trimTrailingSlash(baseUrl);
  const normalizedPath = trimLeadingSlash(path);
  return `${normalizedBase}/${normalizedPath}`;
}

export function resolveLibrariesAsset(path: string): string {
  return resolvePublicPath(`libraries/${trimLeadingSlash(path)}`);
}

