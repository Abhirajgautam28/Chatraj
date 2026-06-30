import { verifyDevPassword } from '../../controllers/diagnostic.controller.js';
import { jest } from '@jest/globals';

describe('Diagnostic Controller - verifyDevPassword', () => {
    let req;
    let res;
    let next;
    let originalEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = process.env;
        process.env = { ...originalEnv };

        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    it('should call next() if password is correct', () => {
        process.env.DEV_UI_PASSWORD = 'supersecretpassword';
        req.headers['x-dev-password'] = 'supersecretpassword';

        verifyDevPassword(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 401 if password is incorrect', () => {
        process.env.DEV_UI_PASSWORD = 'supersecretpassword';
        req.headers['x-dev-password'] = 'wrongpassword';

        verifyDevPassword(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized. Invalid password.' });
    });

    it('should return 401 if no password is provided', () => {
        process.env.DEV_UI_PASSWORD = 'supersecretpassword';
        // not setting x-dev-password

        verifyDevPassword(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized. Invalid password.' });
    });

    it('should return 500 if DEV_UI_PASSWORD is not configured', () => {
        delete process.env.DEV_UI_PASSWORD;
        req.headers['x-dev-password'] = 'somepassword';

        verifyDevPassword(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'DEV_UI_PASSWORD environment variable is not configured on the server.' });
    });
});
