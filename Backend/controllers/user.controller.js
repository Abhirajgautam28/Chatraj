// Send OTP for password reset (used in Login.jsx)
export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Generate OTP
        const otp = generateOTP(7);
        user.otp = otp;
        user.isVerified = false;
        await user.save();
        await sendOtpEmail(user.email, otp);
        res.status(200).json({ message: 'OTP sent to email.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
import userModel from '../models/user.model.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
        res.status(400).send(error.message);
    }
}

// Helper: Generate 7-char OTP
function generateOTP(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += chars[Math.floor(Math.random() * chars.length)];
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
        user = await userModel.findById(userId).select('+otp');
    } else if (email) {
        user = await userModel.findOne({ email }).select('+otp');
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
        const user = await userModel.findOne({ email }).select('+password +googleApiKey');
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
        console.log(err);
        res.status(400).send(err.message);
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
        console.log(err);
        res.status(400).send(err.message);
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
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export const resetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ message: 'Reset link sent to email', resetToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updatePasswordController = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).json({ message: 'Email and new password required' });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = await userModel.hashPassword(newPassword);
        await user.save();

        // Send password reset success email
        await sendPasswordResetSuccessEmail(user.email, user.firstName || user.email);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
    <div style="background:linear-gradient(90deg,#2563eb 0%,#1e293b 100%);padding:32px 0;font-family:'Segoe UI',Arial,sans-serif;color:#fff;text-align:center;">
      <div style="max-width:420px;margin:0 auto;background:#1e293b;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.12);padding:32px 24px;">
        <h2 style="color:#60a5fa;font-size:2rem;margin-bottom:12px;">Password Reset Successful</h2>
        <p style="font-size:1.1rem;margin-bottom:24px;">Hi <b>${name}</b>,<br>Your ChatRaj password has been reset successfully.</p>
        <div style="margin-bottom:24px;">
          <span style="display:inline-block;background:#2563eb;color:#fff;padding:10px 24px;border-radius:999px;font-weight:600;font-size:1.1rem;box-shadow:0 2px 8px rgba(0,0,0,0.12);">You can now login with your new password</span>
        </div>
        <p style="font-size:0.95rem;color:#cbd5e1;margin-bottom:16px;">If you did not request this change, please contact our support team immediately.</p>
        <a href="https://chatraj.com/login" style="display:inline-block;margin-top:12px;padding:10px 32px;background:#60a5fa;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.10);">Login to ChatRaj</a>
        <div style="margin-top:32px;font-size:0.9rem;color:#94a3b8;">Thank you for using ChatRaj!<br>— The ChatRaj Team</div>
      </div>
    </div>
    `;
    let info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
        to: email,
        subject: 'Your ChatRaj Password Has Been Reset',
        html
    });
    console.log('Password reset success email sent: %s', info.messageId);
}
