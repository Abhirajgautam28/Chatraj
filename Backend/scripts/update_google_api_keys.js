// Usage: node scripts/update_google_api_keys.js
// This script updates all users in the database to set the googleApiKey to the real Gemini API key.
// You must set the REAL_KEY below before running!

import mongoose from 'mongoose';
import User from '../models/user.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ChatRaj';
const REAL_KEY = 'YOUR_REAL_GEMINI_API_KEY_HERE'; // <-- CHANGE THIS!

async function updateAllUsers() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({});
  for (const user of users) {
    user.googleApiKey = REAL_KEY;
    await user.save();
  }
  await mongoose.disconnect();
}

updateAllUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
