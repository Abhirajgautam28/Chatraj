import validator from 'validator';

const originalIsURL = validator.isURL && validator.isURL.bind(validator);

function safeIsURL(str, opts) {
  try {
    if (!originalIsURL) return false;

    if (!originalIsURL(str, opts)) return false;

    try {
      const u = new URL(str);
      const protocol = (u.protocol || '').replace(':', '').toLowerCase();

      const allowed = new Set(['http', 'https', 'ftp']);
      if (!allowed.has(protocol)) return false;

      if (!u.hostname) return false;
      return true;
    } catch (err) {
      return false;
    }
  } catch (err) {
    try {
      return Boolean(originalIsURL && originalIsURL(str, opts));
    } catch (e) {
      return false;
    }
  }
}
try {
  if (validator && typeof validator === 'object') {
    validator.isURL = safeIsURL;
  }
} catch (err) {
  console.error('Failed to apply validator.isURL patch:', err && err.message ? err.message : err);
}

export default validator;
