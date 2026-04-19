import userModel from '../models/user.model.js';
import redisClient from './redis.service.js';
import { normalizeEmail } from '../utils/email.js';
import { generateOTP } from '../utils/otp.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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

export const registerUser = async (userData) => {
    const { firstName, lastName, email, password, googleApiKey } = userData;
    const { value: normalizedEmail, isValid } = normalizeEmail(email);
    if (!isValid) throw new Error('Valid email is required');

    const existing = await userModel.findOne({ email: normalizedEmail }).select('+isVerified');
    if (existing && existing.isVerified) {
        throw new Error('Email already registered');
    }

    if (existing && !existing.isVerified) {
        await userModel.deleteOne({ _id: existing._id });
    }

    const hashedPassword = await userModel.hashPassword(password);
    const otp = generateOTP(7);

    const pendingKey = `pending:registration:${normalizedEmail}`;
    const pending = {
        firstName, lastName, email: normalizedEmail,
        passwordHash: hashedPassword, googleApiKey, otp,
        createdAt: Date.now()
    };

    const ttl = parseInt(process.env.REGISTRATION_OTP_TTL_SECONDS || '900', 10);
    await redisClient.set(pendingKey, JSON.stringify(pending), 'EX', ttl);

    await sendOtpEmail(normalizedEmail, otp);
    return { message: 'OTP sent to email. Please verify.' };
};

export const loginUser = async (email, password) => {
    const user = await userModel.findOne({ email: email.trim() }).select('+password +googleApiKey');
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    if (!user.isVerified) throw new Error('Account not verified');

    const token = await user.generateJWT();
    const userObj = user.toObject();
    delete userObj.password;
    return { user: userObj, token };
};
