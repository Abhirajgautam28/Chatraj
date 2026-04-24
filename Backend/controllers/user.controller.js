import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import redisClient from '../services/redis.service.js';
import { normalizeEmail } from '../utils/email.js';
import { shouldExposeOtpToClient } from '../utils/security.js';
import { generateOTP } from '../utils/otp.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';
import { getOtpEmailTemplate, getPasswordResetSuccessTemplate } from '../utils/templates.js';

dotenv.config();

// Send OTP for password reset (used in Login.jsx)
export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return sendError(res, 400, 'Valid email is required');
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return sendError(res, 404, 'User not found');
        // Generate OTP
        const otp = generateOTP(7);
        user.otp = otp;
        user.isVerified = false;
        await user.save();
        await sendOtpEmail(user.email, otp);
        sendSuccess(res, 200, {}, 'OTP sent to email.');
    } catch (error) {
        logger.error('sendOtpController error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

export const getLeaderboardController = async (req, res) => {
    try {
        const users = await User.find({}).sort({ projects: -1 }).limit(10).lean();
        sendSuccess(res, 200, { users });
    } catch (error) {
        sendError(res, 500, 'Internal server error');
    }
};

export const createUserController = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return sendError(res, 400, 'Validation failed', errors.array());
    }
    try {
        const { firstName, lastName, email, password, googleApiKey } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return sendError(res, 400, 'Valid email is required');

        // If a verified user already exists, reject immediately.
        const existing = await User.findOne({ email: normalizedEmail }).select('+isVerified');
        if (existing && existing.isVerified) {
            return sendError(res, 409, 'Email already registered. Please login to your existing account.');
        }

        // If an unverified user exists from an older run, remove it so
        // we don't block re-registration (we will keep pending state in Redis).
        if (existing && !existing.isVerified) {
            try {
                await User.deleteOne({ _id: existing._id });
            } catch (delErr) {
                logger.warn('Failed to remove stale unverified user:', delErr && delErr.message ? delErr.message : delErr);
            }
        }

        // Hash the password now so we can safely persist pending state
        // in Redis without storing plaintext passwords.
        const hashedPassword = await User.hashPassword(password);
        const otp = generateOTP(7);

        // Persist pending registration in Redis with TTL so unverified
        // accounts are not stored in MongoDB until the user verifies.
        const pendingKey = `pending:registration:${normalizedEmail}`;
        const pending = {
            firstName,
            lastName,
            email: normalizedEmail,
            passwordHash: hashedPassword,
            googleApiKey,
            otp,
            createdAt: Date.now()
        };
        const ttl = parseInt(process.env.REGISTRATION_OTP_TTL_SECONDS || '900', 10);
        await redisClient.set(pendingKey, JSON.stringify(pending), 'EX', ttl);

        // Attempt to send OTP email immediately. If sending fails, we keep
        // the pending registration in Redis and schedule background retries
        // so the user can still verify once delivery succeeds.
        try {
            await sendOtpEmail(normalizedEmail, otp);
            return sendSuccess(res, 201, {}, 'OTP sent to email. Please verify.');
        } catch (emailErr) {
            logger.error('sendOtpEmail error (will retry in background):', emailErr && emailErr.message ? emailErr.message : emailErr);

            // Background retry loop (best-effort; survives only while process runs).
            (async function backgroundResend(attempt) {
                const maxAttempts = parseInt(process.env.REGISTRATION_SEND_RETRY_ATTEMPTS || '5', 10);
                const initialBackoff = parseInt(process.env.REGISTRATION_SEND_RETRY_BACKOFF_MS || '2000', 10);
                try {
                    if (attempt > maxAttempts) {
                        logger.error(`Background resend exhausted for ${normalizedEmail}`);
                        return;
                    }
                    const wait = initialBackoff * Math.pow(2, attempt - 1);
                    // wait before retry except on first immediate retry
                    if (attempt > 1) await new Promise(r => setTimeout(r, wait));
                    const latestPendingJson = await redisClient.get(pendingKey);
                    if (!latestPendingJson) {
                        // pending cleared (maybe user verified)
                        return;
                    }
                    const latest = JSON.parse(latestPendingJson);
                    await sendOtpEmail(latest.email, latest.otp);
                    // on success, update pending metadata (do NOT delete - user
                    // must still be able to verify using the OTP). Preserve TTL.
                    try {
                        latest.lastSentAt = Date.now();
                        latest.sentCount = (latest.sentCount || 0) + 1;
                        const newVal = JSON.stringify(latest);

                        // Prefer GETSET which preserves TTL on Redis. If GETSET fails
                        // fall through to TTL-preserving fallback rather than rethrowing.
                        let updatedViaGetSet = false;
                        if (typeof redisClient.getset === 'function') {
                            try {
                                await redisClient.getset(pendingKey, newVal);
                                updatedViaGetSet = true;
                            } catch (e) {
                                logger.warn('redis GETSET failed; falling back to TTL-preserving set:', e && e.message ? e.message : e);
                            }
                        }

                        if (!updatedViaGetSet) {
                            // Fallback: attempt to read remaining TTL and restore it after set
                            let remainingMs = null;
                            if (typeof redisClient.pttl === 'function') {
                                try {
                                    remainingMs = await redisClient.pttl(pendingKey);
                                } catch (e) { remainingMs = null; }
                            }
                            if (remainingMs == null && typeof redisClient.ttl === 'function') {
                                try {
                                    const secs = await redisClient.ttl(pendingKey);
                                    if (typeof secs === 'number' && secs >= 0) remainingMs = secs * 1000;
                                } catch (e) { remainingMs = null; }
                            }
                            if (remainingMs != null && remainingMs > 0) {
                                await redisClient.set(pendingKey, newVal);
                                if (typeof redisClient.pexpire === 'function') {
                                    await redisClient.pexpire(pendingKey, remainingMs);
                                } else if (typeof redisClient.expire === 'function') {
                                    await redisClient.expire(pendingKey, Math.ceil(remainingMs / 1000));
                                }
                            } else {
                                // Couldn't preserve TTL safely; skip metadata update to avoid extending OTP validity
                                logger.warn('Could not preserve TTL for pending registration; skipping metadata update to avoid extending OTP lifetime');
                            }
                        }
                    } catch (updErr) {
                        logger.warn('Failed to update pending registration after resend:', updErr && updErr.message ? updErr.message : updErr);
                    }
                    logger.info(`Background resend succeeded for ${normalizedEmail}`);
                } catch (err) {
                    logger.error('Background resend attempt failed:', err && err.message ? err.message : err);
                    setTimeout(() => backgroundResend(attempt + 1), 0);
                }
            })(1);

            return sendSuccess(res, 201, {}, 'OTP delivery queued. If you do not receive the email shortly, please check spam or try again.');
        }
    } catch (error) {
        logger.error('createUserController error:', error && error.message ? error.message : error);
        // If duplicate key error occurred during a DB op elsewhere, treat
        // it as a conflict for the client.
        if (error && (error.code === 11000 || error.name === 'MongoServerError') && error.keyValue && error.keyValue.email) {
            return sendError(res, 409, 'Email already registered. Please login to your existing account.');
        }

        return sendError(res, 400, 'Invalid request');
    }
}

// Helper: Send OTP email
async function sendOtpEmail(email, otp) {
    // In test environments skip sending real emails to avoid external
    // dependencies and flaky failures when SMTP creds are not configured.
    if (process.env.NODE_ENV === 'test') {
        logger.info('Skipping email send in test environment');
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: email,
        subject: 'Your ChatRaj OTP Verification',
        html: getOtpEmailTemplate(otp),
        text: `Welcome to ChatRaj!\n\nYour OTP is: ${otp}\n\nPlease enter this code in the registration popup to activate your account.`,
    };

    // Use robust send with retry/backoff. Any thrown error will be
    // propagated to the caller so registration flow can respond safely.
    await sendMailWithRetry(mailOptions);
}

// OTP verification for both registration (userId) and password reset (email)
export const verifyOtpController = async (req, res) => {
    const { userId, email, otp } = req.body;
    if ((!userId && !email) || !otp) return sendError(res, 400, 'User ID or email and OTP required');
    let user;
    if (userId) {
        // Validate userId to prevent NoSQL injection and malformed identifiers
        if (typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
            return sendError(res, 400, 'Invalid User ID');
        }
        user = await User.findById(userId).select('+otp');
    } else if (email) {
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return sendError(res, 400, 'Valid email is required');
        user = await User.findOne({ email: normalizedEmail }).select('+otp');
        // If user not found in DB, check for a pending registration stored in Redis
        // (we persist pending registrations there until the user verifies via OTP).
        if (!user) {
            const pendingKey = `pending:registration:${normalizedEmail}`;
            let pendingJson = null;
            try {
                pendingJson = await redisClient.get(pendingKey);
            } catch (redisErr) {
                logger.error('Error checking pending registration in Redis:', redisErr && redisErr.message ? redisErr.message : redisErr);
            }

            if (pendingJson) {
                let pending;
                try {
                    pending = JSON.parse(pendingJson);
                } catch (parseErr) {
                    logger.error('Failed to parse pending registration JSON for', pendingKey, parseErr && (parseErr.message || parseErr));
                    return sendError(res, 500, 'Corrupt pending registration data');
                }

                if (pending.otp !== otp) return sendError(res, 401, 'Invalid OTP');

                // Create the real user record from pending values via userService.
                try {
                    const created = await userService.createUser({
                        firstName: pending.firstName,
                        lastName: pending.lastName,
                        email: pending.email,
                        passwordHash: pending.passwordHash,
                        googleApiKey: pending.googleApiKey,
                        isVerified: true,
                    });
                    // remove pending key
                    await redisClient.del(pendingKey);
                    // generate token for the newly created user
                    const token = await created.generateJWT();
                    // hide password before returning
                    if (created._doc) delete created._doc.password;
                    return sendSuccess(res, 200, { token, user: created }, 'Verified successfully');
                } catch (createErr) {
                    logger.error('Error creating user from pending registration:', createErr && createErr.message ? createErr.message : createErr);
                    // If a duplicate key was created in a race, try to mark existing user as verified
                    if (createErr && (createErr.code === 11000 || createErr.name === 'MongoServerError')) {
                        const existingUser = await User.findOne({ email: normalizedEmail }).select('+otp');
                        if (existingUser) {
                            existingUser.isVerified = true;
                            existingUser.otp = undefined;
                            await existingUser.save();
                            const token = await existingUser.generateJWT();
                            return sendSuccess(res, 200, { token, user: existingUser }, 'Verified successfully');
                        }
                    }
                    return sendError(res, 500, 'Failed to create account');
                }
            }
        }
    }
    if (!user) return sendError(res, 404, 'User not found');
    if (user.otp !== otp) return sendError(res, 401, 'Invalid OTP');
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    let token = null;
    if (userId) token = await user.generateJWT();
    sendSuccess(res, 200, { token, user }, 'Verified successfully');
};

// Admin-only: retrieve masked OTP for debugging. Requires `ADMIN_API_KEY`
export const adminGetOtpController = async (req, res) => {
    try {
        const adminKey = req.get('x-admin-key');
        if (!process.env.ADMIN_API_KEY) return sendError(res, 403, 'Admin API key not configured on server');
        if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) return sendError(res, 403, 'Forbidden');

        const { email, userId } = req.query;
        if (!email && !userId) return sendError(res, 400, 'Provide email or userId');

        let user;
        if (userId) {
            if (typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) return sendError(res, 400, 'Invalid userId');
            user = await User.findById(userId).select('+otp');
        } else {
            const { value: normalizedEmail, isValid } = normalizeEmail(email);
            if (!isValid) return sendError(res, 400, 'Valid email is required');
            user = await User.findOne({ email: normalizedEmail }).select('+otp');
            // If not in DB, check for a pending registration in Redis
            if (!user) {
                try {
                    const pendingKey = `pending:registration:${normalizedEmail}`;
                    const pendingJson = await redisClient.get(pendingKey);
                    if (pendingJson) {
                        try {
                            const pending = JSON.parse(pendingJson);
                            // synthesize a minimal user-like object for masking
                            user = { _id: null, email: normalizedEmail, otp: pending.otp };
                        } catch (parseErr) {
                            logger.error('Failed to parse pending registration JSON for admin OTP:', parseErr && (parseErr.message || parseErr));
                            return sendError(res, 500, 'Corrupt pending registration data');
                        }
                    }
                } catch (redisErr) {
                    logger.error('Failed to read pending registration for admin OTP:', redisErr && redisErr.message ? redisErr.message : redisErr);
                }
            }
        }
        if (!user) return sendError(res, 404, 'User not found');
        const otp = user.otp;
        const masked = typeof otp === 'string' && otp.length > 2 ? `${otp[0]}***${otp[otp.length - 1]}` : '<redacted>';

        // Audit access: log who requested this and what they requested.
        try {
            const requesterIp = req.ip || req.headers['x-forwarded-for'] || req.connection && req.connection.remoteAddress;
            const adminMasked = typeof adminKey === 'string' ? `***${adminKey.slice(-4)}` : '<none>';
            const audit = {
                timestamp: new Date().toISOString(),
                requesterIp,
                adminKey: adminMasked,
                queried: { email: user.email, userId: user._id }
            };
            logger.info('admin-otp-audit', JSON.stringify(audit));
            // Also append to disk log for persistence
            try {
                const fs = await import('fs');
                const logPath = 'logs/admin_otp_audit.log';
                const line = JSON.stringify(audit) + '\n';
                fs.appendFile(logPath, line, (err) => {
                    if (err) logger.warn('Failed to append admin audit log:', err && err.message ? err.message : err);
                });
            } catch (fileErr) {
                logger.warn('Unable to write admin audit log file:', fileErr && fileErr.message ? fileErr.message : fileErr);
            }
        } catch (auditErr) {
            logger.warn('Failed to produce admin audit log:', auditErr && auditErr.message ? auditErr.message : auditErr);
        }
        return sendSuccess(res, 200, { userId: user._id, email: user.email, maskedOtp: masked });
    } catch (err) {
        logger.error('adminGetOtpController error:', err);
        return sendError(res, 500, 'Internal server error');
    }
};

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return sendError(res, 400, 'Validation failed', errors.array());
    }
    try {
        const { email, password } = req.body;
        if (typeof email !== 'string' || typeof password !== 'string') return sendError(res, 400, 'Invalid credentials');
        const user = await User.findOne({ email: email.trim() }).select('+password +googleApiKey');
        if (!user) {
            return sendError(res, 401, 'Invalid credentials');
        }
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid credentials');
        }
        if (!user.isVerified) {
            return sendError(res, 403, 'Account not verified. Please check your email for OTP.');
        }
        const token = await user.generateJWT();
        delete user._doc.password;
        sendSuccess(res, 200, { user, token });
    } catch (err) {
        logger.error('loginController error:', err);
        sendError(res, 400, 'Invalid request');
    }
}

export const profileController = async (req, res) => {

    sendSuccess(res, 200, {
        user: req.user
    });

}

export const logoutController = async (req, res) => {
    try {
        const token =
            req.cookies.token ||
            (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);

        if (token) {
            redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        }

        sendSuccess(res, 200, {}, 'Logged out successfully');
    } catch (err) {
        logger.error('logoutController error:', err);
        sendError(res, 400, 'Invalid request');
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await User.findOne({
            email: req.user.email
        }).lean()

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });
        const usersWithNames = allUsers.map(u => ({
            _id: u._id,
            firstName: u.firstName,
            lastName: u.lastName
        }));
        return sendSuccess(res, 200, {
            users: usersWithNames
        })
    } catch (err) {
        logger.error('getAllUsersController error:', err);
        return sendError(res, 400, 'Unable to fetch users');
    }
}

export const resetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return sendError(res, 400, 'Valid email is required');
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return sendError(res, 404, 'User not found');

        const resetToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        sendSuccess(res, 200, { resetToken }, 'Reset link sent to email');
    } catch (err) {
        logger.error('resetPasswordController error:', err);
        sendError(res, 500, 'Internal server error');
    }
};

export const updatePasswordController = async (req, res) => {
    try {
        let { email, newPassword } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid || typeof newPassword !== 'string') return sendError(res, 400, 'Valid email and a new password (min 8 chars) required');
        newPassword = newPassword.trim();
        if (newPassword.length < 8) return sendError(res, 400, 'Valid email and a new password (min 8 chars) required');

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return sendError(res, 404, 'User not found');

        // Prevent duplicate password reset emails by using a flag
        if (user._passwordResetEmailSent) {
            return sendSuccess(res, 200, {}, 'Password updated successfully');
        }

        user.password = await User.hashPassword(newPassword);
        user._passwordResetEmailSent = true;
        await user.save();

        // Send password reset success email only once
        await sendPasswordResetSuccessEmail(user.email, user.firstName || user.email);

        sendSuccess(res, 200, {}, 'Password updated successfully');
    } catch (err) {
        logger.error('updatePasswordController error:', err);
        sendError(res, 500, 'Internal server error');
    }
};

// Helper: Send password reset success email with modern template
async function sendPasswordResetSuccessEmail(email, name) {
    if (process.env.NODE_ENV === 'test') {
        logger.info('Skipping password reset success email in test environment for', email);
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: typeof email === 'string' ? email.trim() : email,
        subject: 'Your ChatRaj Password Has Been Reset',
        html: getPasswordResetSuccessTemplate(name),
    };
    await sendMailWithRetry(mailOptions);
}
