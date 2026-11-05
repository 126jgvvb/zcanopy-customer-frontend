const AUTH_PATHS = new Set(['/customer', '/customer/signup', '/customer/verify', '/login']);

/**
 * Returns a safe, same-origin path to return to after authentication, or null
 * when the supplied value is missing, external, or an auth page itself (which
 * would cause a redirect loop).
 */
export function safeRedirectPath(value: string | null | undefined): string | null {
  if (!value) return null;

  const path = value.trim();
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return null;
  }

  const pathname = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (AUTH_PATHS.has(pathname)) {
    return null;
  }

  return path;
}

export function withRedirect(path: string, redirectTarget: string | null): string {
  return redirectTarget ? `${path}?redirect=${encodeURIComponent(redirectTarget)}` : path;
}
