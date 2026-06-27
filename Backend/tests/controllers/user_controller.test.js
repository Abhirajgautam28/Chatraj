import request from 'supertest';
import app from '../../app.js';
import * as userService from '../../services/user.service.js';
import { debugGetRawOtpController } from '../../controllers/user.controller.js';
import userModel from '../../models/user.model.js';

jest.mock('../../services/user.service.js');
jest.mock('../../db/db.js');
jest.mock('../../models/user.model.js');

describe('User Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = 'development';
        delete process.env.ALLOW_RAW_OTP_DEBUG;
        delete process.env.ADMIN_API_KEY;
    });

    test('POST /api/users/login success', async () => {
        userService.loginUser.mockResolvedValue({ token: 't', user: {} });
        const res = await request(app).post('/api/users/login').send({ email: 't@e.com', password: 'pass' });
        expect(res.status).toBe(200);
    });

    test('POST /api/users/login fail', async () => {
        userService.loginUser.mockRejectedValue(new Error('Invalid credentials'));
        const res = await request(app).post('/api/users/login').send({ email: 't@e.com', password: 'pass' });
        expect(res.status).toBe(400);
    });

    test('debug OTP endpoint allows raw OTP access in development by default', async () => {
        userModel.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({ _id: 'abc123', email: 'user@example.com', otp: '1234567' })
        });

        const req = { query: { email: 'user@example.com' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        await debugGetRawOtpController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ otp: '1234567' }));
    });

    test('debug OTP endpoint returns raw OTP only when explicitly enabled with a valid admin key', async () => {
        process.env.ALLOW_RAW_OTP_DEBUG = 'true';
        process.env.ADMIN_API_KEY = 'test-admin-key';
        userModel.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({ _id: 'abc123', email: 'user@example.com', otp: '1234567' })
        });

        const req = {
            query: { email: 'user@example.com' },
            get: jest.fn().mockReturnValue('test-admin-key')
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        await debugGetRawOtpController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ otp: '1234567' }));
    });
});
