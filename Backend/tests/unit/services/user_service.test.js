import * as userService from '../../../services/user.service.js';
import userModel from '../../../models/user.model.js';
import redisClient from '../../../services/redis.service.js';

jest.mock('../../../models/user.model.js');
jest.mock('../../../services/redis.service.js');

describe('User Service', () => {
    afterEach(() => jest.clearAllMocks());

    test('registerUser should store pending in redis', async () => {
        userModel.findOne.mockResolvedValue(null);
        userModel.hashPassword.mockResolvedValue('hash');
        const res = await userService.registerUser({ email: 't@e.com', password: 'p', firstName: 'F', lastName: 'L', googleApiKey: 'k' });
        expect(redisClient.set).toHaveBeenCalled();
        expect(res.message).toContain('OTP sent');
    });

    test('loginUser should return user and token', async () => {
        const mockUser = {
            email: 't@e.com', isVerified: true,
            isValidPassword: jest.fn().mockResolvedValue(true),
            generateJWT: jest.fn().mockResolvedValue('token'),
            toObject: () => ({ email: 't@e.com' })
        };
        userModel.findOne.mockImplementation(() => ({ select: jest.fn().mockResolvedValue(mockUser) }));
        const res = await userService.loginUser('t@e.com', 'p');
        expect(res.token).toBe('token');
    });
});
