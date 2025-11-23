
import request from 'supertest';
import app from '../app.js';
import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';
import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../services/redis.service.js', () => ({
  __esModule: true,
  default: {
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn()
  }
}));

jest.mock('../models/project.model.js');
jest.mock('../models/user.model.js', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        findById: jest.fn()
    }
}));
jest.mock('../db/db.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Project Security', () => {
    beforeEach(() => {
        jest.resetAllMocks(); // Reset implementations too
    });

    it('should deny access to getProjectById if user is not a member', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const otherUserId = new mongoose.Types.ObjectId().toString();
        const projectId = new mongoose.Types.ObjectId().toString();

        // Mock Auth
        redisClient.get.mockResolvedValue(null); // Not blacklisted
        jest.spyOn(jwt, 'verify').mockReturnValue({ email: 'test@example.com', _id: userId });

        const mockProject = {
            _id: projectId,
            name: 'Secret Project',
            users: [{ _id: otherUserId }], // Logged in user is NOT here
            fileTree: {}
        };

        // Mock findOne chain: findOne(...).populate(...)
        projectModel.findOne.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValue(mockProject)
        }));

        const res = await request(app)
            .get(`/api/projects/get-project/${projectId}`)
            .set('Authorization', 'Bearer valid_token');

        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('Unauthorized access');
    });

    it('should deny updateFileTree if user is not a member', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const projectId = new mongoose.Types.ObjectId().toString();

        // Mock Auth
        redisClient.get.mockResolvedValue(null);
        jest.spyOn(jwt, 'verify').mockReturnValue({ email: 'test@example.com', _id: userId });

        // For updateFileTree, the service calls findOne({_id, users: userId}) to check permissions
        // We mock it to return null (not found/not authorized)
        projectModel.findOne.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/projects/update-file-tree')
            .send({ projectId, fileTree: { "new": "tree" } })
            .set('Authorization', 'Bearer valid_token');

        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('Unauthorized access');
    });

    it('should allow access to getProjectById if user IS a member', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const projectId = new mongoose.Types.ObjectId().toString();

        redisClient.get.mockResolvedValue(null);
        jest.spyOn(jwt, 'verify').mockReturnValue({ email: 'test@example.com', _id: userId });

        const mockProject = {
            _id: projectId,
            name: 'My Project',
            users: [{ _id: userId }], // User IS here
            fileTree: {}
        };

        projectModel.findOne.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValue(mockProject)
        }));

        const res = await request(app)
            .get(`/api/projects/get-project/${projectId}`)
            .set('Authorization', 'Bearer valid_token');

        expect(res.statusCode).toBe(200);
        expect(res.body.project).toBeDefined();
    });

     it('should allow updateFileTree if user IS a member', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const projectId = new mongoose.Types.ObjectId().toString();

        redisClient.get.mockResolvedValue(null);
        jest.spyOn(jwt, 'verify').mockReturnValue({ email: 'test@example.com', _id: userId });

        const mockProject = {
            _id: projectId,
            users: [userId]
        };

        // Mock permission check: findOne should return the project
        projectModel.findOne.mockResolvedValue(mockProject);

        // Mock update
        projectModel.findOneAndUpdate.mockResolvedValue({ ...mockProject, fileTree: { "new": "tree" } });

        const res = await request(app)
            .put('/api/projects/update-file-tree')
            .send({ projectId, fileTree: { "new": "tree" } })
            .set('Authorization', 'Bearer valid_token');

        expect(res.statusCode).toBe(200);
    });
});
