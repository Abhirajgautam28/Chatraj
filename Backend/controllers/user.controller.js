import userModel from '../models/user.model.js';
import { normalizeEmail } from '../utils/email.js';
import { shouldExposeOtpToClient } from '../utils/security.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import { generateOTP } from '../utils/otp.js';
import { logger } from '../utils/logger.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Helper: escape user-supplied text before inserting into HTML templates
function escapeHtml(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { firstName, lastName, email, password, googleApiKey } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return res.status(400).json({ message: 'Valid email is required' });

        const existing = await userModel.findOne({ email: normalizedEmail }).select('+isVerified').lean();
        if (existing && existing.isVerified) {
            return res.status(409).json({ message: 'Email already registered. Please login to your existing account.' });
        }

        if (existing && !existing.isVerified) {
            try {
                await userModel.deleteOne({ _id: existing._id });
            } catch (delErr) {
                logger.warn('Failed to remove stale unverified user:', delErr && delErr.message ? delErr.message : delErr);
            }
        }

        const hashedPassword = await userModel.hashPassword(password);
        const otp = generateOTP(7);
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

        try {
            await sendOtpEmail(normalizedEmail, otp);
            return res.status(201).json({ message: 'OTP sent to email. Please verify.' });
        } catch (emailErr) {
            logger.error('sendOtpEmail error (will retry in background):', emailErr && emailErr.message ? emailErr.message : emailErr);
            (async function backgroundResend(attempt) {
                const maxAttempts = parseInt(process.env.REGISTRATION_SEND_RETRY_ATTEMPTS || '5', 10);
                const initialBackoff = parseInt(process.env.REGISTRATION_SEND_RETRY_BACKOFF_MS || '2000', 10);
                try {
                    if (attempt > maxAttempts) {
                        logger.error(`Background resend exhausted for ${normalizedEmail}`);
                        return;
                    }
                    const wait = initialBackoff * Math.pow(2, attempt - 1);
                    if (attempt > 1) await new Promise(r => setTimeout(r, wait));
                    const latestPendingJson = await redisClient.get(pendingKey);
                    if (!latestPendingJson) return;
                    const latest = JSON.parse(latestPendingJson);
                    await sendOtpEmail(latest.email, latest.otp);
                    try {
                        latest.lastSentAt = Date.now();
                        latest.sentCount = (latest.sentCount || 0) + 1;
                        const newVal = JSON.stringify(latest);
                        await redisClient.set(pendingKey, newVal, 'KEEPTTL');
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
        if (error && (error.code === 11000 || error.name === 'MongoServerError') && error.keyValue && error.keyValue.email) {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        return res.status(400).json({ message: 'Invalid request' });
    }
}

async function sendOtpEmail(email, otp) {
    if (process.env.NODE_ENV === 'test') {
        logger.info('Skipping email send in test environment');
        return;
    }
    const mailOptions = {
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: email,
        subject: 'Your ChatRaj OTP Verification',
        text: `Welcome to ChatRaj!\n\nYour OTP is: ${otp}\n\nPlease enter this code in the registration popup to activate your account.`,
    };
    await sendMailWithRetry(mailOptions);
}

export const verifyOtpController = async (req, res) => {
    const { userId, email, otp } = req.body;
    if ((!userId && !email) || !otp) return res.status(400).json({ message: 'User ID or email and OTP required' });

    if (email) {
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return res.status(400).json({ message: 'Valid email is required' });

        const pendingKey = `pending:registration:${normalizedEmail}`;
        const pendingJson = await redisClient.get(pendingKey);
        if (pendingJson) {
            const pending = JSON.parse(pendingJson);
            if (pending.otp !== otp) return res.status(401).json({ message: 'Invalid OTP' });
            try {
                const created = await userModel.create({
                    firstName: pending.firstName,
                    lastName: pending.lastName,
                    email: pending.email,
                    password: pending.passwordHash,
                    googleApiKey: pending.googleApiKey,
                    isVerified: true,
                });
                await redisClient.del(pendingKey);
                const token = await created.generateJWT();
                const userObj = created.toObject();
                delete userObj.password;
                return res.status(200).json({ message: 'Verified successfully', token, user: userObj });
            } catch (createErr) {
                if (createErr.code === 11000) {
                    const existingUser = await userModel.findOneAndUpdate(
                        { email: normalizedEmail, isVerified: false },
                        { $set: { isVerified: true }, $unset: { otp: 1 } },
                        { new: true }
                    ).lean();
                    if (existingUser) {
                        const token = jwt.sign({ _id: existingUser._id, email: existingUser.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
                        return res.status(200).json({ message: 'Verified successfully', token, user: existingUser });
                    }
                }
                logger.error('Error creating user from pending registration:', createErr);
                return res.status(500).json({ message: 'Failed to create account' });
            }
        }
    }

    const query = userId ? { _id: userId } : { email: normalizeEmail(email).value };
    const user = await userModel.findOneAndUpdate(
        { ...query, otp: otp },
        { $set: { isVerified: true }, $unset: { otp: 1 } },
        { new: true }
    ).lean();

    if (!user) return res.status(401).json({ message: 'Invalid OTP or user not found' });

    const token = userId ? jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' }) : null;
    res.status(200).json({ message: 'Verified successfully', token, user });
};

export const loginController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email.trim() }).select('+password +googleApiKey');
        if (!user || !(await user.isValidPassword(password))) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ errors: 'Account not verified.' });
        }
        const token = await user.generateJWT();
        const userObj = user.toObject();
        delete userObj.password;
        res.status(200).json({ user: userObj, token });
    } catch (err) {
        logger.error('loginController error:', err);
        res.status(400).json({ error: 'Invalid request' });
    }
}

export const profileController = async (req, res) => {
    res.status(200).json({ user: req.user });
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
        if (token) await redisClient.set(token, 'logout', 'EX', 86400);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        logger.error('logoutController error:', err);
        res.status(400).json({ error: 'Invalid request' });
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const allUsers = await userModel.find({ email: { $ne: req.user.email } }, '_id firstName lastName').lean();
        return res.status(200).json({ users: allUsers });
    } catch (err) {
        logger.error('getAllUsersController error:', err);
        res.status(400).json({ error: 'Unable to fetch users' })
    }
}

export const resetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return res.status(400).json({ message: 'Valid email is required' });
        const user = await userModel.findOne({ email: normalizedEmail }).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ message: 'Reset link sent to email', resetToken });
    } catch (err) {
        logger.error('resetPasswordController error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePasswordController = async (req, res) => {
    try {
        let { email, newPassword } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid || !newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Valid email and password (min 8 chars) required' });

        const hashedPassword = await userModel.hashPassword(newPassword);
        const user = await userModel.findOneAndUpdate(
            { email: normalizedEmail },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });
        await sendPasswordResetSuccessEmail(user.email, user.firstName || user.email);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        logger.error('updatePasswordController error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function sendPasswordResetSuccessEmail(email, name) {
    if (process.env.NODE_ENV === 'test') return;
    const html = `<div style="font-family: sans-serif; padding: 20px;"><h1>Password Reset Successful</h1><p>Hi ${escapeHtml(name)}, your password has been reset.</p></div>`;
    const mailOptions = { from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>', to: email, subject: 'Password Reset Successful', html };
    await sendMailWithRetry(mailOptions);
}

export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return res.status(400).json({ message: 'Valid email is required' });
        const otp = generateOTP(7);
        const user = await userModel.findOneAndUpdate({ email: normalizedEmail }, { $set: { otp, isVerified: false } }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        await sendOtpEmail(user.email, otp);
        res.status(200).json({ message: 'OTP sent to email.' });
    } catch (error) {
        logger.error('sendOtpController error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLeaderboardController = async (req, res) => {
    try {
        const users = await userModel.find({}).sort({ projects: -1 }).limit(10).lean();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const adminGetOtpController = async (req, res) => {
    try {
        const adminKey = req.get('x-admin-key');
        if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) return res.status(403).json({ message: 'Forbidden' });

        const { email, userId, full } = req.query;
        const target = email || userId;
        const query = userId ? { _id: userId } : { email: normalizeEmail(email).value };

        // Audit logging to disk
        const auditEntry = `[${new Date().toISOString()}] Admin Access: GET_OTP | Target: ${target} | KeySuffix: ${adminKey.slice(-4)}\n`;
        try {
            fs.appendFileSync(path.join(process.cwd(), 'audit.log'), auditEntry);
        } catch (e) {
            logger.warn('Failed to write audit log:', e.message);
        }

        const user = await userModel.findOne(query).select('+otp').lean();
        let otp = null;

        if (user && user.otp) {
            otp = user.otp;
        } else {
            const pendingKey = `pending:registration:${normalizeEmail(email).value}`;
            const pendingJson = await redisClient.get(pendingKey);
            if (pendingJson) {
                const pending = JSON.parse(pendingJson);
                otp = pending.otp;
            }
        }

        if (!otp) return res.status(404).json({ message: 'OTP not found' });

        // Mask OTP by default (e.g. A***Z) unless ?full=true is explicitly requested
        const shouldMask = full !== 'true';
        const displayOtp = shouldMask
            ? (otp.length > 2 ? otp[0] + '*'.repeat(otp.length - 2) + otp[otp.length - 1] : '***')
            : otp;

        res.json({ otp: displayOtp });
    } catch (err) {
        logger.error('adminGetOtpController error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
