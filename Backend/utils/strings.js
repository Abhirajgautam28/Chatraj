export const escapeRegex = (s) => {
  if (s === null || s === undefined) {
    throw new TypeError('escapeRegex: input must not be null or undefined');
  }
  const str = typeof s === 'string' ? s : String(s);
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const escapeHtml = (unsafe) => {
	if (unsafe === undefined || unsafe === null) return '';
	return String(unsafe)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
};

export function maskKey(k) {
  if (!k) return '';
  if (k.length <= 10) return '*'.repeat(k.length);
  return k.substring(0, 4) + '*'.repeat(k.length - 8) + k.substring(k.length - 4);
}
