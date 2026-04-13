(async ()=>{
  try {
    const base = 'https://chatraj-backend.onrender.com';
    const origin = 'https://chatraj.vercel.app';
    const r = await fetch(base + '/csrf-token', { method: 'GET', headers: { Origin: origin, Accept: 'application/json' } });
    const j = await r.json();
    const cookie = r.headers.get('set-cookie') || '';
    console.log('csrf token present:', !!j.csrfToken, 'signed present:', !!j.signedCsrf);
    console.log('cookie header:', cookie);

    const login = await fetch(base + '/api/users/login', {
      method: 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        'X-CSRF-SIGNED': j.signedCsrf,
        'Cookie': cookie
      },
      body: JSON.stringify({ email: 'nope@example.com', password: 'wrongpass' })
    });

    console.log('login status:', login.status);
    const text = await login.text();
    console.log('login body:', text);
  } catch (e) {
    console.error('error', e);
  }
})();
