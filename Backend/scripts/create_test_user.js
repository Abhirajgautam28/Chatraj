import User from '../models/user.model.js';
import { loadEnv, connectDB, closeDBAndExit } from './script-utils.js';
import { logger } from '../utils/logger.js';

loadEnv();

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'testuser@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPass123!';

async function run() {
  try {
    await connectDB();
    logger.info('Connected to MongoDB for test user creation');

    // Remove existing test user if present
    const existing = await User.findOne({ email: TEST_USER_EMAIL });
    if (existing) {
      logger.info('Existing test user found, removing...');
      await User.deleteOne({ _id: existing._id });
    }

    const hashed = await User.hashPassword(TEST_USER_PASSWORD);
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: TEST_USER_EMAIL,
      password: hashed,
      googleApiKey: process.env.GOOGLE_AI_KEY || 'test-google-key',
      isVerified: true
    });

    logger.info('Test user created:');
    logger.info(`  email: ${TEST_USER_EMAIL}`);
    logger.info(`  password: ${TEST_USER_PASSWORD}`);

    await closeDBAndExit(0);
  } catch (err) {
    logger.error(`Failed to create test user: ${err && (err.stack || err.message || err)}`);
    await closeDBAndExit(1);
  }
}

run();
