// Usage: node scripts/update_google_api_keys.js
// This script updates all users in the database to set the googleApiKey to the real Gemini API key.
// You must set the REAL_KEY below before running!

import User from '../models/user.model.js';
import { loadEnv, connectDB, closeDBAndExit } from './script-utils.js';

loadEnv();

const REAL_KEY = 'YOUR_REAL_GEMINI_API_KEY_HERE'; // <-- CHANGE THIS!

async function updateAllUsers() {
  await connectDB();
  const users = await User.find({});
  for (const user of users) {
    user.googleApiKey = REAL_KEY;
    await user.save();
    console.log(`Updated user: ${user.email}`);
  }
  console.log('All users updated.');
  await closeDBAndExit(0);
}

updateAllUsers().catch(async err => {
  console.error(err);
  await closeDBAndExit(1);
});
