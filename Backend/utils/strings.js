export const escapeRegex = (s) => {
	if (s === null || s === undefined) {
		throw new TypeError('escapeRegex: input must not be null or undefined');
	}
	const str = typeof s === 'string' ? s : String(s);
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Escapes characters for inclusion in HTML to prevent XSS.
 * @param {string} unsafe - The raw string to escape.
 * @returns {string} The HTML-safe string.
 */
export const escapeHtml = (unsafe) => {
	if (unsafe === undefined || unsafe === null) return '';
	return String(unsafe)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
};

export default escapeRegex;
