import userModel from '../models/user.model.js';
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
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT();

        delete user._doc.password;

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password +googleApiKey');
        if (!user) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }
        // Do NOT delete googleApiKey here, it is needed by frontend
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
        // Send _id, firstName, lastName for each user
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

        // TODO: Send resetToken via email to user.email
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
