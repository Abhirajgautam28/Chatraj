import axios from 'axios';
import assert from 'assert';

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

  // 1) Register
  let res = await axios.post(`${base}/api/users/register`, testUser).catch(e => e.response || e);
  if (res.status !== 201) {
    console.error('Register failed', res.status || res);
    process.exit(1);
  }
  const userId = res.data.userId;

  // 2) Fetch the OTP from DB? No DB shortcut here — attempt verify with invalid OTP should fail.
  let verifyRes = await axios.post(`${base}/api/users/verify-otp`, { userId, otp: 'wrong-otp' }).catch(e => e.response || e);
  if (verifyRes.status === 200) {
    console.error('Verify should not succeed with wrong OTP');
    process.exit(1);
  }


  // 3) Check public blogs listing
  res = await axios.get(`${base}/api/blogs`).catch(e => e.response || e);
  if (res.status !== 200) {
    console.error('Fetching blogs failed', res.status || res);
    process.exit(1);
  }

  // 4) Check project showcase
  res = await axios.get(`${base}/api/projects/showcase`).catch(e => e.response || e);
  if (res.status !== 200) {
    console.error('Fetching showcase failed', res.status || res);
    process.exit(1);
  }

  // 5) Done
}

run().catch(err => {
  console.error('E2E: Error', err.message || err);
  process.exit(1);
});
