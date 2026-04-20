/**
 * Utilities for handling HTTP cookies in a cross-environment compatible way.
 */

/**
 * Extracts an array of individual cookie strings from a 'set-cookie' header.
 * Handles differences between `node-fetch`, `undici`, and standard Fetch API.
 *
 * @param {Response} resp - The HTTP response object.
 * @returns {string[]} An array of cookie strings.
 */
export function extractSetCookieArray(resp) {
  // node-fetch / undici gives headers.raw()
  if (resp.headers && typeof resp.headers.raw === 'function') {
    const raw = resp.headers.raw();
    return raw && raw['set-cookie'] ? raw['set-cookie'] : [];
  }
  const single = resp.headers && resp.headers.get ? resp.headers.get('set-cookie') : null;
  if (!single) return [];
  // split on cookie boundaries
  return String(single).split(/,(?=\s*[^;]+?=)/g);
}

/**
 * Builds a 'Cookie' header string from an array of 'set-cookie' strings.
 * Extracts only the key=value part and joins them with a semicolon.
 *
 * @param {string[]} setCookieArray - Array of raw 'set-cookie' strings.
 * @returns {string} A formatted 'Cookie' header string.
 */
export function buildCookieHeader(setCookieArray) {
  if (!Array.isArray(setCookieArray)) return '';
  return setCookieArray.map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
}
