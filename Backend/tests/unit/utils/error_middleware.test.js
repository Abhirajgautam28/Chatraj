import { errorHandler } from '../../../middleware/error.middleware.js';

describe('Error Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    test('should handle JWT expiration error', () => {
        const err = { name: 'TokenExpiredError' };
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
    });

    test('should handle validation errors', () => {
        const err = {
            name: 'ValidationError',
            errors: {
                email: { message: 'Email required' }
            }
        };
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation Error' }));
    });
});
