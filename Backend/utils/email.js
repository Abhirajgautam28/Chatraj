export const normalizeEmail = (rawEmail) => {
    if (typeof rawEmail !== 'string') {
        return { value: null, isValid: false };
    }

    const trimmed = rawEmail.trim();
    const parts = trimmed.split('@');
    if (parts.length !== 2) {
        return { value: null, isValid: false };
    }

    const local = parts[0];
    const domain = parts[1].toLowerCase();
    const value = `${local}@${domain}`;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    return { value, isValid };
};

export default normalizeEmail;
