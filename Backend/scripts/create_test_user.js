import dotenv from 'dotenv';
import path from 'path';
import connect from '../db/db.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Load the backend .env using the repository working directory so running
// the script from the project root picks up Backend/.env correctly.
dotenv.config({ path: path.resolve(process.cwd(), 'Backend/.env') });

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'testuser@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPass123!';

async function run() {
  try {
    await connect();

    // Remove existing test user if present
    const existing = await User.findOne({ email: TEST_USER_EMAIL });
    if (existing) {
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


    // Close mongoose connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create test user:', err && (err.stack || err.message || err));
    process.exit(1);
  }
}

run();
