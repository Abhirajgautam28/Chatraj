export function extractSetCookieArray(resp) {
  // node-fetch / undici gives headers.raw()
  if (resp.headers && typeof resp.headers.raw === 'function') {
    const raw = resp.headers.raw();
    return raw && raw['set-cookie'] ? raw['set-cookie'] : [];
  }
  const single = resp.headers && resp.headers.get ? resp.headers.get('set-cookie') : null;
  if (!single) return [];
  // split on cookie boundaries
  return String(single).split(/,(?=\s*[^;]+?=)/g);
}

export function buildCookieHeader(setCookieArray) {
  if (!Array.isArray(setCookieArray)) return '';
  return setCookieArray.map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
}
