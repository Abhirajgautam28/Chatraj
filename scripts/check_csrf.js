const url = 'http://localhost:8080/csrf-token';
(async () => {
  try {
    const resp = await fetch(url, { method: 'GET', credentials: 'include' });
    console.log('status', resp.status);
    console.log('headers:');
    for (const [k, v] of resp.headers) console.log(`  ${k}: ${v}`);
    try {
      const data = await resp.json();
      console.log('body:', data);
    } catch (e) {
      console.log('no JSON body');
    }
  } catch (e) {
    console.error('fetch error:', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
