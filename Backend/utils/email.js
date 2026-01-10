export const normalizeEmail = (rawEmail) => {
    if (typeof rawEmail !== 'string') {
        return { value: null, isValid: false };
    }

    const value = rawEmail.trim().toLowerCase();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    return { value, isValid };
};

export default normalizeEmail;
