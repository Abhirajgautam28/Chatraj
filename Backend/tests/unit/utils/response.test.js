import { success, error } from '../../../utils/response.js';

describe('Response Utility', () => {
    let res;
    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    });

    test('success formats correctly', () => {
        success(res, { foo: 'bar' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('error formats correctly', () => {
        error(res, 'Fail', 400);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
});
