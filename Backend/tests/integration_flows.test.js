import request from 'supertest';
import app from '../app.js';
import userModel from '../models/user.model.js';
import projectModel from '../models/project.model.js';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';

jest.mock('../models/user.model.js');
jest.mock('../models/project.model.js');
jest.mock('../services/redis.service.js');
jest.mock('../db/db.js');

describe('Integration Flows', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'secret';
    });

    describe('User Registration and Verification Flow', () => {
        const userData = {
            firstName: 'Flow',
            lastName: 'Test',
            email: 'flow@example.com',
            password: 'password123',
            googleApiKey: 'api-key-1234567890'
        };

        test('should handle successful registration and verification', async () => {
            // 1. Register
            userModel.findOne.mockResolvedValue(null);
            userModel.hashPassword.mockResolvedValue('hashed');
            redisClient.set.mockResolvedValue('OK');

            const regRes = await request(app)
                .post('/api/users/register')
                .send(userData);

            expect(regRes.status).toBe(201);
            expect(regRes.body.message).toContain('OTP sent');
            expect(redisClient.set).toHaveBeenCalledWith(
                expect.stringContaining('pending:registration:flow@example.com'),
                expect.any(String),
                'EX',
                900
            );

            // 2. Verify OTP
            const pendingData = {
                ...userData,
                passwordHash: 'hashed',
                otp: '1234567'
            };
            redisClient.get.mockResolvedValue(JSON.stringify(pendingData));
            userModel.create.mockResolvedValue({
                ...userData,
                _id: 'user123',
                generateJWT: jest.fn().mockResolvedValue('token')
            });

            const verifyRes = await request(app)
                .post('/api/users/verify-otp')
                .send({ email: 'flow@example.com', otp: '1234567' });

            expect(verifyRes.status).toBe(200);
            expect(verifyRes.body.token).toBe('token');
            expect(userModel.create).toHaveBeenCalled();
            expect(redisClient.del).toHaveBeenCalledWith(expect.stringContaining('flow@example.com'));
        });
    });

    describe('Project Creation and File Management Flow', () => {
        const mockUser = { _id: 'u123', email: 'u@e.com' };
        const token = 'valid_token';

        beforeEach(() => {
            redisClient.get.mockResolvedValue(null);
            jest.spyOn(jwt, 'verify').mockReturnValue({ email: mockUser.email, _id: mockUser._id });
            userModel.findOne.mockResolvedValue(mockUser);
        });

        test('should create project and update file tree', async () => {
            // 1. Create Project
            const projectData = { name: 'Flow Project', category: 'Web' };
            projectModel.create.mockResolvedValue({ ...projectData, _id: 'p123', users: [mockUser._id] });

            const createRes = await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${token}`)
                .send(projectData);

            expect(createRes.status).toBe(201);
            expect(createRes.body.project._id).toBe('p123');

            // 2. Update File Tree
            const fileTree = { 'main.js': { content: 'console.log(1)' } };
            projectModel.findOne.mockResolvedValue({ _id: 'p123', users: [mockUser._id] });
            projectModel.findOneAndUpdate.mockResolvedValue({ _id: 'p123', fileTree });

            const updateRes = await request(app)
                .put('/api/projects/update-file-tree')
                .set('Authorization', `Bearer ${token}`)
                .send({ projectId: 'p123', fileTree });

            expect(updateRes.status).toBe(200);
            expect(updateRes.body.project.fileTree).toEqual(fileTree);
        });
    });
});
