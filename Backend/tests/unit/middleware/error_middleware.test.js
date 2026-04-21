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

    test('should handle EBADCSRFTOKEN error', () => {
        const err = { code: 'EBADCSRFTOKEN' };
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid CSRF token' }));
    });

    test('should handle Mongoose ValidationError', () => {
        const err = {
            name: 'ValidationError',
            errors: {
                field: { message: 'Invalid field' }
            }
        };
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation Error' }));
    });

    test('should fallback to 500 status', () => {
        const err = new Error('Random error');
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
