const baseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function trimLeadingSlash(value: string): string {
  return value.startsWith('/') ? value.slice(1) : value;
}

export function resolvePublicPath(path: string): string {
  if (!path) return baseUrl;
  const normalizedBase = baseUrl === '/' ? '' : trimTrailingSlash(baseUrl);
  const normalizedPath = trimLeadingSlash(path);
  return `${normalizedBase}/${normalizedPath}`;
}

export function resolveLibrariesAsset(path: string): string {
  return resolvePublicPath(`libraries/${trimLeadingSlash(path)}`);
}

