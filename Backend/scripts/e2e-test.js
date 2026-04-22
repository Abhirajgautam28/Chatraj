import axios from 'axios';
import assert from 'assert';
import { logger } from '../utils/logger.js';

const base = process.env.BASE_URL || 'http://localhost:8080';

const rnd = Math.random().toString(36).slice(2,8);
const testUser = {
  firstName: 'E2E',
  lastName: 'Tester',
  email: `e2e+${rnd}@example.com`,
  password: 'password123',
  googleApiKey: 'fake-key-1234567890'
};

async function run() {
  logger.info('E2E: Using base URL ' + base);

  // 1) Register
  logger.info('E2E: Registering user ' + testUser.email);
  let res = await axios.post(`${base}/api/users/register`, testUser).catch(e => e.response || e);
  if (res.status !== 201) {
    logger.error('Register failed ' + (res.status || res));
    process.exit(1);
  }
  const userId = res.data.userId;
  logger.info('E2E: Registered userId ' + userId);

  // 2) Fetch the OTP from DB? No DB shortcut here — attempt verify with invalid OTP should fail.
  logger.info('E2E: Attempting verify with invalid OTP (should fail)');
  let verifyRes = await axios.post(`${base}/api/users/verify-otp`, { userId, otp: 'wrong-otp' }).catch(e => e.response || e);
  if (verifyRes.status === 200) {
    logger.error('Verify should not succeed with wrong OTP');
    process.exit(1);
  }

  logger.info('E2E: Skipping OTP verify (requires email), proceeding to check public endpoints');

  // 3) Check public blogs listing
  logger.info('E2E: Fetching public blogs');
  res = await axios.get(`${base}/api/blogs`).catch(e => e.response || e);
  if (res.status !== 200) {
    logger.error('Fetching blogs failed ' + (res.status || res));
    process.exit(1);
  }
  logger.info('E2E: Blogs fetched, count = ' + (Array.isArray(res.data) ? res.data.length : 0));

  // 4) Check project showcase
  res = await axios.get(`${base}/api/projects/showcase`).catch(e => e.response || e);
  if (res.status !== 200) {
    logger.error('Fetching showcase failed ' + (res.status || res));
    process.exit(1);
  }
  logger.info('E2E: Projects showcase fetched');

  // 5) Done
  logger.info('E2E: Completed light flow checks successfully');
}

run().catch(err => {
  logger.error('E2E: Error ' + (err.message || err));
  process.exit(1);
});
