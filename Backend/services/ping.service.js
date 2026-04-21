import https from 'https';
import { logger } from '../utils/logger.js';

const pingService = (url) => {
    setInterval(() => {
        https.get(url, (resp) => {
            if (resp.statusCode === 200) {
                logger.info('Server kept alive');
            }
        }).on('error', (err) => {
            logger.error('Ping error:', err.message);
        });
    }, 840000);
};

export default pingService;