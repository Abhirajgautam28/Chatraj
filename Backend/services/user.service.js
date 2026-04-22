import userModel from '../models/user.model.js';
import redisClient from './redis.service.js';
import { normalizeEmail } from '../utils/email.js';
import { generateOTP } from '../utils/otp.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import { getPasswordResetHtml } from '../utils/templates.js';
import { withCache } from '../utils/cache.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const sendOtpEmail = async (email, otp) => {
    if (process.env.NODE_ENV === 'test') return;
    const mailOptions = {
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: email,
        subject: 'Your ChatRaj OTP Verification',
        text: `Welcome to ChatRaj!\n\nYour OTP is: ${otp}\n\nPlease enter this code in the registration popup to activate your account.`,
    };
    await sendMailWithRetry(mailOptions);
};

export const sendOtp = async (email) => {
    const { value: normalizedEmail, isValid } = normalizeEmail(email);
    if (!isValid) throw new Error('Valid email is required');

    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) throw new Error('User not found');

    const otp = generateOTP(7);
    user.otp = otp;
    user.isVerified = false;
    await user.save();

    await sendOtpEmail(user.email, otp);
    return { message: 'OTP sent to email.' };
};

export const registerUser = async (userData) => {
    const { firstName, lastName, email, password, googleApiKey } = userData;
    const { value: normalizedEmail, isValid } = normalizeEmail(email);
    if (!isValid) throw new Error('Valid email is required');

    const existing = await userModel.findOne({ email: normalizedEmail }).select('+isVerified');
    if (existing && existing.isVerified) throw new Error('Email already registered');

    if (existing && !existing.isVerified) await userModel.deleteOne({ _id: existing._id });

    const hashedPassword = await userModel.hashPassword(password);
    const otp = generateOTP(7);
    const pendingKey = `pending:registration:${normalizedEmail}`;
    const pending = { firstName, lastName, email: normalizedEmail, passwordHash: hashedPassword, googleApiKey, otp, createdAt: Date.now() };

    const ttl = parseInt(process.env.REGISTRATION_OTP_TTL_SECONDS || '900', 10);
    await redisClient.set(pendingKey, JSON.stringify(pending), 'EX', ttl);
    await sendOtpEmail(normalizedEmail, otp);
    return { message: 'OTP sent to email. Please verify.' };
};

export const verifyOtp = async ({ userId, email, otp }) => {
    let user;
    if (userId) {
        if (typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid User ID');
        user = await userModel.findById(userId).select('+otp');
    } else if (email) {
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) throw new Error('Valid email is required');
        user = await userModel.findOne({ email: normalizedEmail }).select('+otp');

        if (!user) {
            const pendingKey = `pending:registration:${normalizedEmail}`;
            const pendingJson = await redisClient.get(pendingKey);
            if (pendingJson) {
                const pending = JSON.parse(pendingJson);
                if (pending.otp !== otp) throw new Error('Invalid OTP');

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
                delete userObj.otp;
                delete userObj.googleApiKey;
                return { message: 'Verified successfully', token, user: userObj };
            }
        }
    }

    if (!user) throw new Error('User not found');
    if (user.otp !== otp) throw new Error('Invalid OTP');

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    let token = null;
    if (userId) token = await user.generateJWT();
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.googleApiKey;
    return { message: 'Verified successfully', token, user: userObj };
};

export const adminGetOtp = async (adminKey, { email, userId }) => {
    if (!process.env.ADMIN_API_KEY) throw new Error('Admin API key not configured');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) throw new Error('Forbidden');

    let user;
    if (userId) {
        if (typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid userId');
        user = await userModel.findById(userId).select('+otp');
    } else {
        const { value: normalizedEmail, isValid } = normalizeEmail(email);
        if (!isValid) throw new Error('Valid email is required');
        user = await userModel.findOne({ email: normalizedEmail }).select('+otp');
        if (!user) {
            const pendingKey = `pending:registration:${normalizedEmail}`;
            const pendingJson = await redisClient.get(pendingKey);
            if (pendingJson) {
                const pending = JSON.parse(pendingJson);
                user = { _id: null, email: normalizedEmail, otp: pending.otp };
            }
        }
    }

    if (!user) throw new Error('User not found');
    const otp = user.otp;
    const masked = typeof otp === 'string' && otp.length > 2 ? `${otp[0]}***${otp[otp.length - 1]}` : '<redacted>';
    return { userId: user._id, email: user.email, maskedOtp: masked };
};

export const loginUser = async (email, password) => {
    const user = await userModel.findOne({ email: email.trim() }).select('+password +googleApiKey');
    if (!user || !(await user.isValidPassword(password))) throw new Error('Invalid credentials');
    if (!user.isVerified) throw new Error('Account not verified');

    const token = await user.generateJWT();
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.googleApiKey;
    delete userObj.otp;

    // Cache the profile for fast lookups
    await redisClient.set(`user:profile:${user._id}`, JSON.stringify(userObj), 'EX', 3600);

    return { user: userObj, token };
};

export const getAllUsers = async ({ userId }) => {
    return await withCache(`users:all:exclude:${userId}`, 300, async () => {
        return await userModel.find({ _id: { $ne: userId } }).select('firstName lastName _id');
    });
};

export const resetPassword = async (email) => {
    const { value: normalizedEmail, isValid } = normalizeEmail(email);
    if (!isValid) throw new Error('Valid email is required');
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) throw new Error('User not found');

    const resetToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    return { message: 'Reset link sent to email', resetToken };
};

export const updatePassword = async (email, newPassword) => {
    const { value: normalizedEmail, isValid } = normalizeEmail(email);
    if (!isValid || typeof newPassword !== 'string' || newPassword.trim().length < 8) {
        throw new Error('Valid email and a new password (min 8 chars) required');
    }

    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) throw new Error('User not found');

    if (user._passwordResetEmailSent) return { message: 'Password updated successfully' };

    user.password = await userModel.hashPassword(newPassword.trim());
    user._passwordResetEmailSent = true;
    await user.save();

    const mailOptions = {
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: user.email,
        subject: 'Your ChatRaj Password Has Been Reset',
        html: getPasswordResetHtml(user.firstName || user.email),
        text: `Hi ${user.firstName || user.email},\n\nYour ChatRaj password has been reset successfully.\n\nYou can now login with your new password at: https://chatraj.vercel.app/login\n\nIf you did not request this change, please contact our support team immediately.\n\nThank you,\nAbhiraj Gautam\nChatRaj Developer`,
    };
    await sendMailWithRetry(mailOptions);

    return { message: 'Password updated successfully' };
};

export const getLeaderboard = async () => {
    return await withCache('leaderboard:top10', 300, async () => {
        return await userModel.find({}).sort({ projects: -1 }).limit(10).select('firstName lastName projects _id');
    });
};
