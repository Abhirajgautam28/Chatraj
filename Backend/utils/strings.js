export const escapeRegex = (s) => {
	const str = typeof s === 'string' ? s : String(s);
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
