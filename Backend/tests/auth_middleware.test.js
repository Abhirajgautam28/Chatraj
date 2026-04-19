import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';
import { authUser } from '../middleware/auth.middleware.js';

jest.mock('jsonwebtoken');
jest.mock('../services/redis.service.js');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            cookies: {},
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            cookie: jest.fn()
        };
        next = jest.fn();
        process.env.JWT_SECRET = 'secret';
    });

    test('should allow access for valid token', async () => {
        req.cookies.token = 'valid_token';
        redisClient.get.mockResolvedValue(null);
        jwt.verify.mockReturnValue({ email: 'test@example.com' });

        await authUser(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual({ email: 'test@example.com' });
    });

    test('should return 401 if no token provided', async () => {
        await authUser(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ error: 'Unauthorized User' });
    });

    test('should return 401 if token is blacklisted', async () => {
        req.headers.authorization = 'Bearer blacklisted_token';
        redisClient.get.mockResolvedValue('logout');

        await authUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.cookie).toHaveBeenCalledWith('token', '');
    });

    test('should return 401 if jwt verification fails', async () => {
        req.cookies.token = 'invalid_token';
        redisClient.get.mockResolvedValue(null);
        jwt.verify.mockImplementation(() => { throw new Error('Invalid'); });

        await authUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});
