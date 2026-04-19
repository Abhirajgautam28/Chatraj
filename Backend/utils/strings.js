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

export const maskKey = (k) => {
	if (!k) return '';
	const str = String(k);
	if (str.length <= 12) return str.slice(0, 3) + '...' + str.slice(-3);
	return str.slice(0, 6) + '...' + str.slice(-6);
};

export default {
	escapeRegex,
	escapeHtml,
	maskKey
};
