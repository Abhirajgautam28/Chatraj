import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connect from '../db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads environment variables from Backend/.env relative to the script directory.
 */
export function loadEnv() {
  dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
}

/**
 * Parses command line arguments into a key-value object.
 * Supports --key=value and --key formats.
 *
 * @returns {Object} Parsed arguments.
 */
export function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      result[key] = value !== undefined ? value : true;
    }
  });
  return result;
}

/**
 * Connects to the database and handles process exit on failure.
 */
export async function connectDB() {
  try {
    await connect();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err && (err.stack || err.message || err));
    process.exit(1);
  }
}

/**
 * Gracefully closes the database connection and exits the process.
 *
 * @param {number} [code=0] - Exit code.
 */
export async function closeDBAndExit(code = 0) {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (err) {
    console.error('Error closing DB connection:', err);
  } finally {
    process.exit(code);
  }
}
