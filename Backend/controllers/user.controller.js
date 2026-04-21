import mongoose from 'mongoose';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import response from '../utils/response.js';
import dotenv from 'dotenv';
dotenv.config();

// Send OTP for password reset (used in Login.jsx)
export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await userService.sendOtp(email);
        return response.success(res, result);
    } catch (err) {
        const status = (err.message === 'Valid email is required' || err.message === 'User not found') ? 400 : 500;
        return response.error(res, err.message, status);
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
        const result = await userService.registerUser(req.body);
        return response.success(res, result, 'Registration pending. OTP sent.', 201);
    } catch (err) {
        const status = err.message === 'Email already registered' ? 409 : 400;
        return response.error(res, err.message, status);
    }
}

// OTP verification for both registration (userId) and password reset (email)
export const verifyOtpController = async (req, res) => {
    try {
        const result = await userService.verifyOtp(req.body);
        return response.success(res, result);
    } catch (err) {
        const status = err.message === 'Invalid OTP' ? 401 : (err.message === 'User not found' ? 404 : 400);
        return response.error(res, err.message, status);
    }
};

// Admin-only: retrieve masked OTP for debugging. Requires `ADMIN_API_KEY`
export const adminGetOtpController = async (req, res) => {
    try {
        const result = await userService.adminGetOtp(req.get('x-admin-key'), req.query);
        return response.success(res, result);
    } catch (err) {
        const status = err.message === 'Forbidden' ? 403 : (err.message === 'User not found' ? 404 : 400);
        return response.error(res, err.message, status);
    }
};

export const loginController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(res, 'Validation failed', 400, errors.array());

    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        return response.success(res, result, 'Login successful');
    } catch (err) {
        const status = err.message === 'Invalid credentials' ? 401 : (err.message === 'Account not verified' ? 403 : 400);
        return response.error(res, err.message, status);
    }
}

export const profileController = async (req, res) => {
    return response.success(res, { user: req.user });
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
        if (token) redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        return response.success(res, null, 'Logged out successfully');
    } catch (err) {
        return response.error(res, 'Invalid request', 400);
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const allUsers = await userService.getAllUsers({ userId: req.user._id });
        const usersWithNames = allUsers.map(u => ({ _id: u._id, firstName: u.firstName, lastName: u.lastName }));
        return response.success(res, { users: usersWithNames })
    } catch (err) {
        return response.error(res, 'Unable to fetch users', 400);
    }
}

export const resetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await userService.resetPassword(email);
        return response.success(res, result);
    } catch (err) {
        const status = err.message === 'User not found' ? 404 : 500;
        return response.error(res, err.message, status);
    }
};

export const updatePasswordController = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const result = await userService.updatePassword(email, newPassword);
        return response.success(res, result);
    } catch (err) {
        return response.error(res, err.message, 400);
    }
};
