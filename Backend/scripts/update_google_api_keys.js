// Usage: node scripts/update_google_api_keys.js
// This script updates all users in the database to set the googleApiKey to the real Gemini API key.
// You must set the REAL_KEY below before running!

import User from '../models/user.model.js';
import { loadEnv, connectDB, closeDBAndExit } from './script-utils.js';
import { logger } from '../utils/logger.js';

loadEnv();

const REAL_KEY = process.env.GOOGLE_AI_KEY || 'YOUR_REAL_GEMINI_API_KEY_HERE';

async function updateAllUsers() {
  try {
    await connectDB();
    const users = await User.find({});
    for (const user of users) {
      user.googleApiKey = REAL_KEY;
      await user.save();
      logger.info(`Updated user: ${user.email}`);
    }
    logger.info('All users updated.');
    await closeDBAndExit(0);
  } catch (err) {
    logger.error(`Failed to update users: ${err.message}`);
    await closeDBAndExit(1);
  }
}

updateAllUsers();
