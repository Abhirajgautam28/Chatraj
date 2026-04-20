/**
 * String manipulation and utility functions for ChatRaj.
 */

/**
 * Partially masks a sensitive key, leaving only the first 4 and last 4 characters visible.
 * If the key is shorter than or equal to 10 characters, it is fully masked.
 *
 * @param {string} k - The key to be masked.
 * @returns {string} The masked key.
 */
export function maskKey(k) {
  if (k.length <= 10) return '*'.repeat(k.length);
  return k.substring(0, 4) + '*'.repeat(k.length - 8) + k.substring(k.length - 4);
}

/**
 * Escapes HTML special characters to prevent XSS.
 *
 * @param {string} str - The string containing HTML characters.
 * @returns {string} The escaped string.
 */
export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes characters with special meaning in regular expressions.
 *
 * @param {string} string - The string to be escaped.
 * @returns {string} The escaped string for use in a RegExp.
 */
export function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
