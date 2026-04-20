import { maskKey, escapeHtml, escapeRegex } from '../utils/strings.js';
import { generateOTP } from '../utils/otp.js';
import { extractSetCookieArray } from '../utils/cookies.js';
import { logger } from '../utils/logger.js';

console.log('--- Testing strings.js ---');
console.log('maskKey(123456789012):', maskKey('123456789012'));
console.log('escapeHtml("<div>"):', escapeHtml('<div>'));
console.log('escapeRegex("a.b"):', escapeRegex('a.b'));

console.log('\n--- Testing otp.js ---');
const otp = generateOTP(7);
console.log('generateOTP(7):', otp, 'Length:', otp.length);

console.log('\n--- Testing cookies.js ---');
const mockResp = { headers: { get: () => 'token=abc; Path=/, other=123; HttpOnly' } };
console.log('extractSetCookieArray:', JSON.stringify(extractSetCookieArray(mockResp)));

console.log('\n--- Testing logger.js ---');
logger.info('Test info log');
logger.warn('Test warn log');
logger.error('Test error log');

console.log('\nVERIFICATION COMPLETE');
