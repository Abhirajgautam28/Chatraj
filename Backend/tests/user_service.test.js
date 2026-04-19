import userModel from '../models/user.model.js';
import * as userService from './user.service.js';

jest.mock('../models/user.model.js');

describe('User Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        const userData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            googleApiKey: 'api-key-123'
        };

        test('should successfully create a user', async () => {
            userModel.hashPassword.mockResolvedValue('hashedPassword');
            userModel.create.mockResolvedValue({ ...userData, password: 'hashedPassword', _id: 'user123' });

            const user = await userService.createUser(userData);

            expect(userModel.hashPassword).toHaveBeenCalledWith('password123');
            expect(userModel.create).toHaveBeenCalledWith(expect.objectContaining({
                email: 'john@example.com',
                password: 'hashedPassword'
            }));
            expect(user._id).toBe('user123');
        });

        test('should throw error if required fields are missing', async () => {
            const incompleteData = { firstName: 'John' };
            await expect(userService.createUser(incompleteData)).rejects.toThrow('All fields are required');
        });
    });

    describe('getAllUsers', () => {
        test('should return all users except the current one', async () => {
            const mockUsers = [{ _id: 'u2', firstName: 'Jane' }, { _id: 'u3', firstName: 'Bob' }];
            userModel.find.mockResolvedValue(mockUsers);

            const users = await userService.getAllUsers({ userId: 'u1' });

            expect(userModel.find).toHaveBeenCalledWith({ _id: { $ne: 'u1' } });
            expect(users).toEqual(mockUsers);
        });
    });
});
