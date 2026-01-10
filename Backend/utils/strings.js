export const escapeRegex = (s) => {
	if (s === null || s === undefined) {
		throw new TypeError('escapeRegex: input must be a string, received null or undefined');
	}
	const str = typeof s === 'string' ? s : String(s);
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
