import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('User Model', () => {
    describe('hashPassword', () => {
        test('should hash password correctly', async () => {
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashed_password');

            const result = await User.hashPassword('my_password');

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith('my_password', 'salt');
            expect(result).toBe('hashed_password');
        });
    });

    describe('methods.generateJWT', () => {
        test('should generate a valid JWT', () => {
            process.env.JWT_SECRET = 'test_secret';
            const userData = {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe'
            };
            const user = new User(userData);
            jwt.sign.mockReturnValue('mocked_token');

            const token = user.generateJWT();

            expect(jwt.sign).toHaveBeenCalledWith(
                expect.objectContaining(userData),
                'test_secret',
                { expiresIn: '24h' }
            );
            expect(token).toBe('mocked_token');
        });
    });

    describe('methods.isValidPassword', () => {
        test('should compare passwords correctly', async () => {
            const user = new User({ password: 'hashed_password' });
            bcrypt.compare.mockResolvedValue(true);

            const result = await user.isValidPassword('plain_password');

            expect(bcrypt.compare).toHaveBeenCalledWith('plain_password', 'hashed_password');
            expect(result).toBe(true);
        });
    });
});
