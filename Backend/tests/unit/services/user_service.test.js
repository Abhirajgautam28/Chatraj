import * as userService from '../../../services/user.service.js';
import userModel from '../../../models/user.model.js';
import redisClient from '../../../services/redis.service.js';
import mongoose from 'mongoose';

jest.mock('../../../models/user.model.js');
jest.mock('../../../services/redis.service.js');
jest.mock('../../../utils/mailer.js', () => ({
    sendMailWithRetry: jest.fn().mockResolvedValue({ messageId: 'id' })
}));

describe('User Service - Deepened', () => {
    afterEach(() => jest.clearAllMocks());

    describe('registerUser', () => {
        test('should throw error if email is already registered and verified', async () => {
            userModel.findOne.mockImplementation(() => ({
                select: jest.fn().mockResolvedValue({ isVerified: true })
            }));
            await expect(userService.registerUser({ email: 'test@example.com' }))
                .rejects.toThrow('Email already registered');
        });

        test('should delete old unverified user before registering new one', async () => {
            userModel.findOne.mockImplementation(() => ({
                select: jest.fn().mockResolvedValue({ _id: 'old', isVerified: false })
            }));
            userModel.hashPassword.mockResolvedValue('hash');
            await userService.registerUser({ email: 'test@example.com', password: 'password', firstName: 'F', lastName: 'L', googleApiKey: 'k' });
            expect(userModel.deleteOne).toHaveBeenCalledWith({ _id: 'old' });
        });
    });

    describe('verifyOtp', () => {
        test('should throw error for invalid userId format', async () => {
            await expect(userService.verifyOtp({ userId: 'invalid' }))
                .rejects.toThrow('Invalid User ID');
        });

        test('should throw error if user not found in DB or Redis', async () => {
            userModel.findOne.mockImplementation(() => ({ select: jest.fn().mockResolvedValue(null) }));
            redisClient.get.mockResolvedValue(null);
            await expect(userService.verifyOtp({ email: 'test@example.com', otp: '1234567' }))
                .rejects.toThrow('User not found');
        });

        test('should verify registration from Redis', async () => {
            userModel.findOne.mockImplementation(() => ({ select: jest.fn().mockResolvedValue(null) }));
            redisClient.get.mockResolvedValue(JSON.stringify({
                otp: '1234567',
                firstName: 'F',
                lastName: 'L',
                email: 'test@example.com',
                passwordHash: 'hash',
                googleApiKey: 'k'
            }));
            userModel.create.mockResolvedValue({
                generateJWT: () => 'token',
                toObject: () => ({ email: 'test@example.com' })
            });

            const res = await userService.verifyOtp({ email: 'test@example.com', otp: '1234567' });
            expect(res.message).toBe('Verified successfully');
            expect(res.token).toBe('token');
            expect(userModel.create).toHaveBeenCalled();
        });

        test('should throw error for incorrect OTP', async () => {
            userModel.findOne.mockImplementation(() => ({
                select: jest.fn().mockResolvedValue({ otp: 'correct' })
            }));
            await expect(userService.verifyOtp({ email: 'test@example.com', otp: 'wrong' }))
                .rejects.toThrow('Invalid OTP');
        });
    });

    describe('updatePassword', () => {
        test('should throw error for short password', async () => {
            await expect(userService.updatePassword('test@example.com', 'short'))
                .rejects.toThrow('Valid email and a new password (min 8 chars) required');
        });

        test('should hash new password and save', async () => {
            const mockUser = { email: 'test@example.com', save: jest.fn().mockResolvedValue(true) };
            userModel.findOne.mockResolvedValue(mockUser);
            userModel.hashPassword.mockResolvedValue('new-hash');

            await userService.updatePassword('test@example.com', 'new-password888');
            expect(mockUser.password).toBe('new-hash');
            expect(mockUser.save).toHaveBeenCalled();
        });
    });
});
