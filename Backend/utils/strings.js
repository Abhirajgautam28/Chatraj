export const escapeRegex = (s) => {
	if (s === null || s === undefined) {
		throw new TypeError('escapeRegex: input must not be null or undefined');
	}
	const str = typeof s === 'string' ? s : String(s);
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export function maskKey(k) {
	if (!k) return '';
	if (k.length <= 12) return k.slice(0, 3) + '...' + k.slice(-3);
	return k.slice(0, 6) + '...' + k.slice(-6);
}

export default escapeRegex;
