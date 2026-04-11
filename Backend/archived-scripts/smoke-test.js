import axios from 'axios';
import util from 'util';

const bases = [process.env.BASE_URL || 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://[::1]:8080'];
const endpoints = [
  '/health',
  '/api/blogs',
  '/api/users/leaderboard',
  '/api/projects/showcase'
];

(async () => {
  console.log('Running smoke tests against bases:', bases.join(', '));
  for (const baseUrl of bases) {
    console.log('\nTesting base URL:', baseUrl);
    for (const ep of endpoints) {
      const url = baseUrl.replace(/\/$/, '') + ep;
      try {
        const res = await axios.get(url, { timeout: 5000 });
        console.log(`${ep} -> ${res.status} ${res.statusText}`);
        if (res.data) {
          const dataPreview = JSON.stringify(res.data).slice(0, 300);
          console.log('  Response preview:', dataPreview);
        }
      } catch (err) {
        console.error(`\n---- ERROR for ${ep} ----`);
        try {
          console.error('Error message:', err.message);
          if (err.code) console.error('Error code:', err.code);
          if (err.config) console.error('Request config url:', err.config.url);
          if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response body:', util.inspect(err.response.data, { depth: 2 }));
          }
          console.error('Stack:', err.stack);
        } catch (inner) {
          console.error('Failed to print error details:', inner);
        }
        console.error('---- END ERROR ----\n');
      }
    }
  }
})();
