import dotenv from 'dotenv';
dotenv.config();

import connect from '../db/db.js';
import userModel from '../models/user.model.js';
import mongoose from 'mongoose';

const [, , email] = process.argv;

if (!email) {
  console.error('Usage: node verify_user_by_email.mjs user@example.com');
  process.exit(1);
}

async function run() {
  try {
    await connect();
    // give mongoose a moment to establish connection
    await new Promise((r) => setTimeout(r, 1000));

    const user = await userModel.findOne({ email: email.trim() });
    if (!user) {
      console.error('User not found:', email);
      process.exit(2);
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    console.log('User verified:', user.email);
    process.exit(0);
  } catch (err) {
    console.error('Error verifying user:', err);
    process.exit(3);
  }
}

run();
