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

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
