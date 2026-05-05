import { validationResult } from 'express-validator';
import * as userService from '../services/user.service.js';
import userModel from '../models/user.model.js';
import * as response from '../utils/response.js';
import redisClient from '../services/redis.service.js';
import crypto from 'crypto';
import { normalizeEmail } from '../utils/email.js';
import { logger } from "../utils/logger.js";
import mongoose from 'mongoose';

import { sendMailWithRetry } from '../utils/mailer.js';
import { escapeHtml } from '../utils/strings.js';

// Send OTP for password reset (used in Login.jsx)
export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return res.status(400).json({ message: 'Valid email is required' });
        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Generate OTP
        const otp = generateOTP(7);
        user.resetPasswordOtp = otp;
        await user.save();
        await sendOtpEmail(user.email, otp);
        res.status(200).json({ message: 'OTP sent to email.' });
    } catch (error) {
        logger.error('sendOtpController error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLeaderboardController = async (req, res) => {
    try {
        const users = await userService.getLeaderboard();
        return response.success(res, { users });
    } catch (err) {
        return response.error(res, 'Internal server error');
    }
};

export const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(res, 'Validation failed', 400, errors.array());

    try {
        const { firstName, lastName, email, password, googleApiKey } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return res.status(400).json({ message: 'Valid email is required' });

        // If a verified user already exists, reject immediately.
        const existing = await userModel.findOne({ email: normalizedEmail }).select('+isVerified');
        if (existing && existing.isVerified) {
            return res.status(409).json({ message: 'Email already registered. Please login to your existing account.' });
        }

        // If an unverified user exists from an older run, remove it so
        // we don't block re-registration (we will keep pending state in Redis).
        if (existing && !existing.isVerified) {
            try {
                await userModel.deleteOne({ _id: existing._id });
            } catch (delErr) {
                logger.warn('Failed to remove stale unverified user:', delErr && delErr.message ? delErr.message : delErr);
            }
        }

        // Hash the password now so we can safely persist pending state
        // in Redis without storing plaintext passwords.
        const hashedPassword = await userModel.hashPassword(password);
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
            return res.status(201).json({ message: 'OTP sent to email. Please verify.' });
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

            return res.status(201).json({ message: 'OTP delivery queued. If you do not receive the email shortly, please check spam or try again.' });
        }
    } catch (error) {
        logger.error('createUserController error:', error && error.message ? error.message : error);
        // If duplicate key error occurred during a DB op elsewhere, treat
        // it as a conflict for the client.
        if (error && (error.code === 11000 || error.name === 'MongoServerError') && error.keyValue && error.keyValue.email) {
            return res.status(409).json({ message: 'Email already registered. Please login to your existing account.' });
        }

        return res.status(400).json({ message: 'Invalid request' });
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
}

// OTP verification for both registration (userId) and password reset (email)
export const verifyOtpController = async (req, res) => {
    const { userId, email, otp } = req.body;
    if ((!userId && !email) || !otp) return res.status(400).json({ message: 'User ID or email and OTP required' });
    let user;
    if (userId) {
        // Validate userId to prevent NoSQL injection and malformed identifiers
        if (typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }
        user = await userModel.findById(userId).select('+otp');
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.otp !== otp) return res.status(401).json({ message: 'Invalid OTP' });
        user.isVerified = true;
        user.otp = undefined;
        await user.save();
        const token = await user.generateJWT();
        return res.status(200).json({ message: 'Verified successfully', token, user });
    } else if (email) {
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return res.status(400).json({ message: 'Valid email is required' });
        user = await userModel.findOne({ email: normalizedEmail }).select('+otp +resetPasswordOtp');
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
                    return res.status(500).json({ message: 'Corrupt pending registration data' });
                }

                if (pending.otp !== otp) return res.status(401).json({ message: 'Invalid OTP' });

                // Create the real user record from pending values.
                try {
                    const created = await userModel.create({
                        firstName: pending.firstName,
                        lastName: pending.lastName,
                        email: pending.email,
                        password: pending.passwordHash,
                        googleApiKey: pending.googleApiKey,
                        isVerified: true,
                    });
                    // remove pending key
                    await redisClient.del(pendingKey);
                    // generate token for the newly created user
                    const token = await created.generateJWT();
                    // hide password before returning
                    if (created._doc) delete created._doc.password;
                    return res.status(200).json({ message: 'Verified successfully', token, user: created });
                } catch (createErr) {
                    logger.error('Error creating user from pending registration:', createErr && createErr.message ? createErr.message : createErr);
                    // If a duplicate key was created in a race, try to mark existing user as verified
                    if (createErr && (createErr.code === 11000 || createErr.name === 'MongoServerError')) {
                        const existingUser = await userModel.findOne({ email: normalizedEmail }).select('+otp');
                        if (existingUser) {
                            existingUser.isVerified = true;
                            existingUser.otp = undefined;
                            await existingUser.save();
                            const token = await existingUser.generateJWT();

                            // Set the token cookie
                            res.cookie('token', token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                                maxAge: 24 * 60 * 60 * 1000 // 24 hours
                            });

                            return res.status(200).json({ message: 'Verified successfully', token, user: existingUser });
                        }
                    }
                    return res.status(500).json({ message: 'Failed to create account' });
                }
            }
            return res.status(404).json({ message: 'User not found' });
        } else {
            // Password reset verification flow
            if (user.resetPasswordOtp && user.resetPasswordOtp === otp) {
                user.resetPasswordOtp = undefined;
                await user.save();
                // Issue a short-lived reset token
                const resetToken = jwt.sign(
                    { email: user.email, purpose: 'password-reset' },
                    process.env.JWT_SECRET,
                    { expiresIn: '15m' }
                );
                return res.status(200).json({ message: 'OTP verified', resetToken });
            }
            // Registration verification fallback logic for email (legacy approach)
            if (user.otp === otp) {
                 user.isVerified = true;
                 user.otp = undefined;
                 await user.save();
                 const token = await user.generateJWT();
                 return res.status(200).json({ message: 'Verified successfully', token, user });
            }
            return res.status(401).json({ message: 'Invalid OTP' });
        }
    }
};

// Admin-only: retrieve masked OTP for debugging. Requires `ADMIN_API_KEY`
export const adminGetOtpController = async (req, res) => {
    try {
        const adminKey = req.get('x-admin-key');
        if (!process.env.ADMIN_API_KEY) return res.status(403).json({ message: 'Admin API key not configured on server' });
        if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) return res.status(403).json({ message: 'Forbidden' });

        const { email, userId } = req.query;
        if (!email && !userId) return res.status(400).json({ message: 'Provide email or userId' });

        let user;
        if (userId) {
            if (typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid userId' });
            user = await userModel.findById(userId).select('+otp');
        } else {
            const { value: normalizedEmail, isValid } = normalizeEmail(email);
            if (!isValid) return res.status(400).json({ message: 'Valid email is required' });
            user = await userModel.findOne({ email: normalizedEmail }).select('+otp');
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
                            return res.status(500).json({ message: 'Corrupt pending registration data' });
                        }
                    }
                } catch (redisErr) {
                    logger.error('Failed to read pending registration for admin OTP:', redisErr && redisErr.message ? redisErr.message : redisErr);
                }
            }
        }
        if (!user) return res.status(404).json({ message: 'User not found' });
        const otp = user.otp;
        const masked = typeof otp === 'string' && otp.length > 2 ? `${otp[0]}***${otp[otp.length - 1]}` : '<redacted>';

        // Audit access: log who requested this and what they requested.
        try {
            const requesterIp = req.ip;
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
        return res.status(200).json({ userId: user._id, email: user.email, maskedOtp: masked });
    } catch (err) {
        logger.error('adminGetOtpController error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const loginController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(res, 'Validation failed', 400, errors.array());

    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);

        // Set the token cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        return response.success(res, result, 'Login successful');
    } catch (err) {
        logger.error('loginController error:', err);
        res.status(400).json({ error: 'Invalid request' });
    }
}

export const profileController = async (req, res) => {
    return response.success(res, { user: req.user });
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
        if (token) redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        // Clear the token cookie
        res.cookie('token', '', { expires: new Date(0), httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' });

        return response.success(res, null, 'Logged out successfully');
    } catch (err) {
        logger.error('logoutController error:', err);
        res.status(400).json({ error: 'Invalid request' });
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const allUsers = await userService.getAllUsers({ userId: req.user._id });
        const usersWithNames = allUsers.map(u => ({ _id: u._id, firstName: u.firstName, lastName: u.lastName }));
        return response.success(res, { users: usersWithNames })
    } catch (err) {
        logger.error('getAllUsersController error:', err);
        res.status(400).json({ error: 'Unable to fetch users' })
    }
}

export const updatePasswordController = async (req, res) => {
    try {
        const { newPassword } = req.body;
        // The email is extracted from the JWT token via the authResetPassword middleware
        const email = req.resetUser.email;
        const result = await userService.updatePassword(email, newPassword);
        return response.success(res, result);
    } catch (err) {
        logger.error('updatePasswordController error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper: Send password reset success email with modern template
async function sendPasswordResetSuccessEmail(email, name) {
    if (process.env.NODE_ENV === 'test') {
        logger.info('Skipping password reset success email in test environment for', email);
        return;
    }

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fc; padding: 40px; border-radius: 16px; color: #222; box-shadow: 0 4px 24px rgba(37,99,235,0.08);">
        <div style="text-align:center;">
          <h1 style="color: #2563eb; font-size: 2.2em; margin-bottom: 8px;">Password Reset Successful 🎉</h1>
          <p style="font-size: 1.15em; color: #444; margin-bottom: 24px;">Hi <b>${escapeHtml(name)}</b>, your ChatRaj password has been reset successfully.</p>
        </div>
        <div style="background: #eaf1fb; border-radius: 10px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #2563eb; margin-bottom: 12px;">What's Next?</h2>
          <ul style="font-size: 16px; line-height: 1.7; margin:0; padding-left: 18px;">
            <li>🔑 <b>Login with your new password</b> – Your account is now secure and ready to use.</li>
            <li>📧 <b>Keep your email updated</b> – Ensure you receive important notifications.</li>
          </ul>
        </div>
        <div style="background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 24px; border: 1px solid #e3eaf5;">
          <h2 style="color: #2563eb; margin-bottom: 12px;">🚀 Need Help?</h2>
          <ul style="font-size: 16px; line-height: 1.7; margin:0; padding-left: 18px;">
            <li>💡 Weekly tips, tutorials, and best practices.</li>
            <li>🗣️ Direct feedback channel to the ChatRaj team.</li>
          </ul>
        </div>
        <div style="text-align:center; margin-top:32px;">
          <a href="https://chatraj.vercel.app/login" style="display:inline-block;margin-top:12px;padding:12px 36px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:1.05rem;box-shadow:0 2px 8px rgba(0,0,0,0.10);">Login to ChatRaj</a>
          <p style="font-size: 15px; color: #555; margin-top:24px;">Thank you for choosing ChatRaj.<br/>Abhiraj Gautam<br/>ChatRaj Developer<br/><a href='https://abhirajgautam.in' style="color: #2563eb;">abhirajgautam.in</a></p>
          <p style="font-size:13px; color:#888; margin-top:16px;">If you did not request this change, please contact our support team immediately.</p>
        </div>
      </div>
    `;
    const mailOptions = {
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: typeof email === 'string' ? email.trim() : email,
        subject: 'Your ChatRaj Password Has Been Reset',
        html,
    };
    await sendMailWithRetry(mailOptions);
}
