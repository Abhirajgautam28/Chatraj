import mongoose from 'mongoose';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import dotenv from 'dotenv';
dotenv.config();

// Send OTP for password reset (used in Login.jsx)
export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await userService.sendOtp(email);
        res.status(200).json(result);
    } catch (error) {
        const status = (error.message === 'Valid email is required' || error.message === 'User not found') ? 400 : 500;
        res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

export const getLeaderboardController = async (req, res) => {
    try {
        const users = await userService.getLeaderboard();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const result = await userService.registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        const status = error.message === 'Email already registered' ? 409 : 400;
        res.status(status).json({ message: error.message || 'Invalid request' });
    }
}

// OTP verification for both registration (userId) and password reset (email)
export const verifyOtpController = async (req, res) => {
    try {
        const result = await userService.verifyOtp(req.body);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message === 'Invalid OTP' ? 401 : (error.message === 'User not found' ? 404 : 400);
        res.status(status).json({ message: error.message });
    }
};

// Admin-only: retrieve masked OTP for debugging. Requires `ADMIN_API_KEY`
export const adminGetOtpController = async (req, res) => {
    try {
        const result = await userService.adminGetOtp(req.get('x-admin-key'), req.query);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message === 'Forbidden' ? 403 : (error.message === 'User not found' ? 404 : 400);
        res.status(status).json({ message: error.message });
    }
};

export const loginController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        res.status(200).json(result);
    } catch (err) {
        const status = err.message === 'Invalid credentials' ? 401 : (err.message === 'Account not verified' ? 403 : 400);
        res.status(status).json({ errors: err.message });
    }
}

export const profileController = async (req, res) => {
    res.status(200).json({ user: req.user });
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
        if (token) redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(400).send('Invalid request');
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const allUsers = await userService.getAllUsers({ userId: req.user._id });
        const usersWithNames = allUsers.map(u => ({ _id: u._id, firstName: u.firstName, lastName: u.lastName }));
        return res.status(200).json({ users: usersWithNames })
    } catch (err) {
        res.status(400).json({ error: 'Unable to fetch users' })
    }
}

export const resetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await userService.resetPassword(email);
        res.json(result);
    } catch (err) {
        const status = err.message === 'User not found' ? 404 : 500;
        res.status(status).json({ message: err.message });
    }
};

export const updatePasswordController = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const result = await userService.updatePassword(email, newPassword);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
