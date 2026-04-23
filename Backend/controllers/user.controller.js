import mongoose from 'mongoose';
import { withCache, invalidateCache } from '../utils/cache.js';
import userModel from '../models/user.model.js';
import { normalizeEmail } from '../utils/email.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { escapeHtml } from '../utils/strings.js';

export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return res.status(400).json({ message: 'Valid email is required' });

        const otp = generateOTP(7);
        const user = await userModel.findOneAndUpdate(
            { email: normalizedEmail },
            { $set: { otp, isVerified: false } },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        await sendOtpEmail(user.email, otp);
        res.status(200).json({ message: 'OTP sent to email.' });
    } catch (error) {
        console.error('sendOtpController error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLeaderboardController = async (req, res) => {
    try {
        const cacheKey = 'user:leaderboard:zset';
        if (typeof redisClient.zrevrange === 'function') {
            try {
                const topIdsWithScores = await redisClient.zrevrange(cacheKey, 0, 9, 'WITHSCORES');
                if (topIdsWithScores && topIdsWithScores.length > 0) {
                    const idsToFetch = [];
                    const scoresMap = {};
                    for (let i = 0; i < topIdsWithScores.length; i += 2) {
                        const id = topIdsWithScores[i];
                        const score = topIdsWithScores[i + 1];
                        idsToFetch.push(id);
                        scoresMap[id] = parseInt(score, 10);
                    }

                    // Optimized Batch Lookup for missing profiles
                    const users = await userModel.find({ _id: { $in: idsToFetch } })
                        .select('firstName lastName')
                        .lean();

                    // Sort back to preserve leaderboard order
                    const sortedUsers = idsToFetch.map(id => {
                        const u = users.find(user => user._id.toString() === id);
                        return u ? { ...u, projectsCount: scoresMap[id] } : null;
                    }).filter(Boolean);

                    if (sortedUsers.length > 0) return res.status(200).json({ users: sortedUsers });
                }
            } catch (zerr) {
                console.warn('Redis ZSET leaderboard fetch failed:', zerr);
            }
        }

        const users = await withCache('user:leaderboard:v4', 600, async () => {
            return await userModel.find({})
                .select('firstName lastName projectsCount')
                .sort({ projectsCount: -1 })
                .limit(10)
                .lean();
        });
        res.status(200).json({ users });
    } catch (error) {
        console.error('getLeaderboardController error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { firstName, lastName, email, password, googleApiKey } = req.body;
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) return res.status(400).json({ message: 'Valid email is required' });

        const hashedPassword = await userModel.hashPassword(password);
        const otp = generateOTP(7);

        const existing = await userModel.findOne({ email: normalizedEmail }).select('+isVerified');
        if (existing && existing.isVerified) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        const pendingKey = `pending:registration:${normalizedEmail}`;
        const pendingData = { firstName, lastName, email: normalizedEmail, passwordHash: hashedPassword, googleApiKey, otp };
        await redisClient.set(pendingKey, JSON.stringify(pendingData), 'EX', 900);

        await sendOtpEmail(normalizedEmail, otp);
        return res.status(201).json({ message: 'OTP sent to email. Please verify.' });
    } catch (error) {
        console.error('createUserController error:', error);
        res.status(400).json({ message: 'Invalid request' });
    }
}

function generateOTP(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += chars[crypto.randomInt(chars.length)];
    }
    return otp;
}

async function sendOtpEmail(email, otp) {
    if (process.env.NODE_ENV === 'test') return;
    const mailOptions = {
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: email,
        subject: 'Your ChatRaj OTP Verification',
        text: `Your OTP is: ${otp}`,
    };
    await sendMailWithRetry(mailOptions);
}

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email.trim() }).select('+password +googleApiKey');
        if (!user || !(await user.isValidPassword(password))) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }
        if (!user.isVerified) return res.status(403).json({ errors: 'Account not verified.' });

        const token = await user.generateJWT();
        res.status(200).json({ user, token });
    } catch (err) {
        res.status(400).send('Invalid request');
    }
}

export const profileController = async (req, res) => {
    res.status(200).json({ user: req.user });
}

export const logoutController = async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
        await redisClient.set(token, 'logout', 'EX', 86400);
    }
    res.status(200).json({ message: 'Logged out successfully' });
}

export const getAllUsersController = async (req, res) => {
    try {
        const { search, limit, skip } = req.query;
        const users = await userService.getAllUsers({
            userId: req.user._id,
            search,
            limit: limit ? parseInt(limit, 10) : 50,
            skip: skip ? parseInt(skip, 10) : 0
        });
        return res.status(200).json({ users });
    } catch (err) {
        res.status(400).json({ error: 'Unable to fetch users' });
    }
}
