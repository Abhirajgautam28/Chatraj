import fs from 'fs';

// Safely parse pending registration JSON stored in Redis.
// Returns parsed object or null on error. Errors are logged without
// printing the raw JSON to avoid leaking OTPs or password hashes.
export function safeParsePendingRegistration(json, key) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (err) {
    try {
      const errMsg = err && (err.message || String(err));
      console.error(`Failed to parse pending registration JSON for ${key}: ${errMsg}`);
    } catch (logErr) {
      // swallow any logging errors
    }
    return null;
  }
}

// Mask an email for logs so local part isn't fully exposed.
export function maskEmailForLogs(email) {
  if (typeof email !== 'string') return '<redacted>';
  const at = email.indexOf('@');
  if (at <= 0) return '<redacted>';
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const first = local[0] || '';
  const last = local[local.length - 1] || '';
  return `${first}***${last}@${domain}`;
}
