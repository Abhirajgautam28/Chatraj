import axios from 'axios';
import util from 'util';
import { logger } from '../utils/logger.js';

const bases = [process.env.BASE_URL || 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://[::1]:8080'];
const endpoints = [
  '/health',
  '/api/blogs',
  '/api/users/leaderboard',
  '/api/projects/showcase'
];

(async () => {
  logger.info('Running smoke tests against bases: ' + bases.join(', '));
  for (const baseUrl of bases) {
    logger.info('\nTesting base URL: ' + baseUrl);
    for (const ep of endpoints) {
      const url = baseUrl.replace(/\/$/, '') + ep;
      try {
        const res = await axios.get(url, { timeout: 5000 });
        logger.info(`${ep} -> ${res.status} ${res.statusText}`);
        if (res.data) {
          const dataPreview = JSON.stringify(res.data).slice(0, 300);
          logger.info('  Response preview: ' + dataPreview);
        }
      } catch (err) {
        logger.error(`\n---- ERROR for ${ep} ----`);
        try {
          logger.error('Error message: ' + err.message);
          if (err.code) logger.error('Error code: ' + err.code);
          if (err.config) logger.error('Request config url: ' + err.config.url);
          if (err.response) {
            logger.error('Response status: ' + err.response.status);
            logger.error('Response body: ' + util.inspect(err.response.data, { depth: 2 }));
          }
          logger.error('Stack: ' + err.stack);
        } catch (inner) {
          logger.error('Failed to print error details: ' + inner);
        }
        logger.error('---- END ERROR ----\n');
      }
    }
  }
})();
