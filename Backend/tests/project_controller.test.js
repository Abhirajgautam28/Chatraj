import request from 'supertest';
import app from '../app.js';
import projectModel from '../models/project.model.js';
import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';

jest.mock('../models/project.model.js');
jest.mock('../models/user.model.js');
jest.mock('../services/redis.service.js');
jest.mock('../db/db.js');

describe('Project Controller', () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    const token = 'mock_token';

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'secret';
        redisClient.get.mockResolvedValue(null);
        jest.spyOn(jwt, 'verify').mockReturnValue({ email: mockUser.email, _id: mockUser._id });
        userModel.findOne.mockResolvedValue(mockUser);
    });

    describe('GET /api/projects/all', () => {
        test('should return all projects for user', async () => {
            const mockProjects = [{ name: 'P1' }, { name: 'P2' }];
            projectModel.find.mockResolvedValue(mockProjects);

            const res = await request(app)
                .get('/api/projects/all')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.projects).toEqual(mockProjects);
            expect(projectModel.find).toHaveBeenCalledWith({ users: { $in: [mockUser._id] } });
        });
    });

    describe('POST /api/projects/create', () => {
        test('should create a project', async () => {
            const projectData = { name: 'New P', category: 'DSA' };
            projectModel.create.mockResolvedValue({ ...projectData, _id: 'p1' });

            const res = await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${token}`)
                .send(projectData);

            expect(res.status).toBe(201);
            expect(res.body.project.name).toBe('new p'); // lowercase from model logic? Wait, controller doesn't lowercase, model does.
        });
    });

    describe('GET /api/projects/get-project/:projectId', () => {
        test('should return 400 for invalid projectId', async () => {
             const res = await request(app)
                .get('/api/projects/get-project/invalid')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(400);
        });
    });
});
