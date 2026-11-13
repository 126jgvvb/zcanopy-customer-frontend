/* eslint-disable no-console */

/**
 * Writes a diagnostic message to the browser console in development only.
 *
 * The browser console belongs to whoever is using the site, and the payloads
 * behind these messages carry customer names, NINs, wallet balances and
 * session tokens. None of it should ever be written to the console of a
 * production build, so every diagnostic goes through here.
 */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
}
