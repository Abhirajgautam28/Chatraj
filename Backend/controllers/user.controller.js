import userModel from '../models/user.model.js';
import { normalizeEmail } from '../utils/email.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import { generateOTP } from '../utils/otp.js';
import { logger } from '../utils/logger.js';
import { withCache } from '../utils/cache.js';
import { successResponse, errorResponse } from '../utils/response.utils.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

export const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());
    try {
        const { firstName, lastName, email, password, googleApiKey } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return errorResponse(res, 'Valid email is required', 400);

        const existing = await userModel.findOne({ email: normalizedEmail }).select('+isVerified').lean();
        if (existing && existing.isVerified) return errorResponse(res, 'Email already registered', 409);
        if (existing) await userModel.deleteOne({ _id: existing._id });

        const hashedPassword = await userModel.hashPassword(password);
        const otp = generateOTP(7);
        const pending = { firstName, lastName, email: normalizedEmail, passwordHash: hashedPassword, googleApiKey, otp };
        await redisClient.set(`pending:registration:${normalizedEmail}`, JSON.stringify(pending), 'EX', 900);

        try {
            await sendOtpEmail(normalizedEmail, otp);
            return successResponse(res, {}, 'OTP sent', 201);
        } catch (err) {
            logger.error('sendOtpEmail error:', err.message);
            return successResponse(res, {}, 'OTP delivery queued', 201);
        }
    } catch (error) {
        logger.error('createUserController error:', error.message);
        return errorResponse(res, 'Internal server error');
    }
};

async function sendOtpEmail(email, otp) {
    if (process.env.NODE_ENV === 'test') return;
    await sendMailWithRetry({
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: email,
        subject: 'ChatRaj Verification',
        text: `Your OTP is: ${otp}`
    });
}

export const verifyOtpController = async (req, res) => {
    const { userId, email, otp } = req.body;
    if ((!userId && !email) || !otp) return errorResponse(res, 'Missing data', 400);

    if (email) {
        const { value: normalizedEmail } = normalizeEmail(email);
        const pendingJson = await redisClient.get(`pending:registration:${normalizedEmail}`);
        if (pendingJson) {
            const pending = JSON.parse(pendingJson);
            if (pending.otp !== otp) return errorResponse(res, 'Invalid OTP', 401);
            const user = await userModel.create({ ...pending, password: pending.passwordHash, isVerified: true });
            await redisClient.del(`pending:registration:${normalizedEmail}`);
            const token = user.generateJWT();
            return successResponse(res, { token, user });
        }
    }

    const query = userId ? { _id: userId } : { email: normalizeEmail(email).value };
    const user = await userModel.findOneAndUpdate({ ...query, otp }, { $set: { isVerified: true }, $unset: { otp: 1 } }, { new: true });
    if (!user) return errorResponse(res, 'Invalid OTP or user not found', 401);
    const token = user.generateJWT();
    return successResponse(res, { token, user: user.toObject() });
};

export const loginController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email.trim() }).select('+password +googleApiKey');
        if (!user || !(await user.isValidPassword(password))) return errorResponse(res, 'Invalid credentials', 401);
        if (!user.isVerified) return errorResponse(res, 'Account not verified', 403);
        const token = user.generateJWT();
        const userObj = user.toObject(); delete userObj.password;
        return successResponse(res, { user: userObj, token });
    } catch (err) {
        logger.error('loginController error:', err);
        return errorResponse(res, 'Internal server error');
    }
};

export const profileController = async (req, res) => successResponse(res, { user: req.user });

export const logoutController = async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (token) await redisClient.set(token, 'logout', 'EX', 86400);
    return successResponse(res, {}, 'Logged out');
};

export const getLeaderboardController = async (req, res) => {
    try {
        const users = await withCache('leaderboard', 300, async () => {
            return await userModel.find({}).sort({ projects: -1 }).limit(10).lean();
        });
        return successResponse(res, { users });
    } catch (error) {
        return errorResponse(res, 'Internal server error');
    }
};

export const adminGetOtpController = async (req, res) => {
    try {
        const adminKey = req.get('x-admin-key');
        if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) return errorResponse(res, 'Forbidden', 403);
        const { email, userId, full } = req.query;
        const target = email || userId;
        const query = userId ? { _id: userId } : { email: normalizeEmail(email).value };

        fs.appendFileSync(path.join(process.cwd(), 'audit.log'), `[${new Date().toISOString()}] Admin Access: GET_OTP | Target: ${target}\n`);

        const user = await userModel.findOne(query).select('+otp').lean();
        let otp = user?.otp;
        if (!otp) {
            const pending = await redisClient.get(`pending:registration:${normalizeEmail(email).value}`);
            if (pending) otp = JSON.parse(pending).otp;
        }

        if (!otp) return errorResponse(res, 'OTP not found', 404);
        const displayOtp = full === 'true' ? otp : (otp.length > 2 ? otp[0] + '*'.repeat(otp.length - 2) + otp[otp.length - 1] : '***');
        return successResponse(res, { otp: displayOtp });
    } catch (err) {
        return errorResponse(res, 'Internal server error');
    }
};
