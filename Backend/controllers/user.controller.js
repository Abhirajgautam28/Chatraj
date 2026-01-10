import mongoose from 'mongoose';

// Send OTP for password reset (used in Login.jsx)
export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: 'Valid email is required' });
        const user = await userModel.findOne({ email: email.trim() });
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Generate OTP
        const otp = generateOTP(7);
        user.otp = otp;
        user.isVerified = false;
        await user.save();
        await sendOtpEmail(user.email, otp);
        res.status(200).json({ message: 'OTP sent to email.' });
    } catch (error) {
        console.error('sendOtpController error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLeaderboardController = async (req, res) => {
    try {
        const users = await userModel.find({}).sort({ projects: -1 }).limit(10);
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
import userModel from '../models/user.model.js';
import nodemailer from 'nodemailer';
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
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const createUserController = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Generate OTP
        const otp = generateOTP(7);
        // Create user with OTP and isVerified false
        const user = await userService.createUser({ ...req.body, otp, isVerified: false });
        // Send OTP email
        await sendOtpEmail(user.email, otp);
        res.status(201).json({ message: 'OTP sent to email. Please verify.', userId: user._id });
    } catch (error) {
        console.error('createUserController error:', error);
        res.status(400).send('Invalid request');
    }
}

// Helper: Generate 7-char OTP
function generateOTP(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const index = crypto.randomInt(chars.length);
        otp += chars[index];
    }
    return otp;
}

// Helper: Send OTP email
async function sendOtpEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    let info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: email,
        subject: 'Your ChatRaj OTP Verification',
        text: `Welcome to ChatRaj!\n\nYour OTP is: ${otp}\n\nPlease enter this code in the registration popup to activate your account.`
    });
    console.log('OTP email sent: %s', info.messageId);
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
    } else if (email) {
        if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: 'Valid email is required' });
        user = await userModel.findOne({ email: email.trim() }).select('+otp');
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp) return res.status(401).json({ message: 'Invalid OTP' });
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    let token = null;
    if (userId) token = await user.generateJWT();
    res.status(200).json({ message: 'Verified successfully', token, user });
};

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ errors: 'Invalid credentials' });
        const user = await userModel.findOne({ email: email.trim() }).select('+password +googleApiKey');
        if (!user) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ errors: 'Account not verified. Please check your email for OTP.' });
        }
        const token = await user.generateJWT();
        delete user._doc.password;
        res.status(200).json({ user, token });
    } catch (err) {
        console.error('loginController error:', err);
        res.status(400).send('Invalid request');
    }
}

export const profileController = async (req, res) => {

    res.status(200).json({
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

        res.status(200).json({
            message: 'Logged out successfully'
        });
    } catch (err) {
        console.error('logoutController error:', err);
        res.status(400).send('Invalid request');
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });
        const usersWithNames = allUsers.map(u => ({
            _id: u._id,
            firstName: u.firstName,
            lastName: u.lastName
        }));
        return res.status(200).json({
            users: usersWithNames
        })
    } catch (err) {
        console.error('getAllUsersController error:', err);
        res.status(400).json({ error: 'Unable to fetch users' })
    }
}

export const resetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: 'Valid email is required' });
        const user = await userModel.findOne({ email: email.trim() });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ message: 'Reset link sent to email', resetToken });
    } catch (err) {
        console.error('resetPasswordController error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePasswordController = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (typeof email !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) return res.status(400).json({ message: 'Valid email and a new password (min 8 chars) required' });

        const user = await userModel.findOne({ email: email.trim() });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent duplicate password reset emails by using a flag
        if (user._passwordResetEmailSent) {
            return res.json({ message: 'Password updated successfully' });
        }

        user.password = await userModel.hashPassword(newPassword);
        user._passwordResetEmailSent = true;
        await user.save();

        // Send password reset success email only once
        await sendPasswordResetSuccessEmail(user.email, user.firstName || user.email);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('updatePasswordController error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper: Send password reset success email with modern template
async function sendPasswordResetSuccessEmail(email, name) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
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
    let info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: typeof email === 'string' ? email.trim() : email,
        subject: 'Your ChatRaj Password Has Been Reset',
        html
    });
    console.log('Password reset success email sent: %s', info.messageId);
}
