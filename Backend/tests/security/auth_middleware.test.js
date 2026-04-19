import jwt from 'jsonwebtoken';
import redisClient from '../../services/redis.service.js';
import { authUser } from '../../middleware/auth.middleware.js';

jest.mock('jsonwebtoken');
jest.mock('../../services/redis.service.js');

describe('Auth Middleware', () => {
    let req, res, next;
    beforeEach(() => {
        req = { cookies: {}, headers: {} };
        res = { status: jest.fn().mockReturnThis(), send: jest.fn(), cookie: jest.fn() };
        next = jest.fn();
        process.env.JWT_SECRET = 'secret';
    });

    test('should allow valid token', async () => {
        req.cookies.token = 'valid';
        redisClient.get.mockResolvedValue(null);
        jwt.verify.mockReturnValue({ email: 't@e.com' });
        await authUser(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user.email).toBe('t@e.com');
    });

    test('should reject blacklisted token', async () => {
        req.headers.authorization = 'Bearer black';
        redisClient.get.mockResolvedValue('logout');
        await authUser(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});
