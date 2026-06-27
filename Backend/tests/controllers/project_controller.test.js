import request from 'supertest';
import app from '../../app.js';
import * as projectService from '../../services/project.service.js';
import jwt from 'jsonwebtoken';

jest.mock('../../services/project.service.js');
jest.mock('../../services/redis.service.js');

import projectModel from '../../models/project.model.js';
jest.mock('../../models/project.model.js');

describe('Project Controller', () => {
    process.env.JWT_SECRET = 'secret';
    const mockToken = jwt.sign({ _id: 'user123', email: 'test@example.com' }, process.env.JWT_SECRET);

    describe('GET /api/projects/all', () => {
        test('should return projects for the user', async () => {
            projectModel.find.mockResolvedValue([{ name: 'Project 1' }]);
            const res = await request(app)
                .get('/api/projects/all')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.projects).toHaveLength(1);
        });

        test('should return 500 if an error occurs', async () => {
            projectModel.find.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .get('/api/projects/all')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(500);
        });
    });

    describe('POST /api/projects/create', () => {
        test('should create a new project', async () => {
            projectModel.create.mockResolvedValue({ name: 'newp' });
            const res = await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ name: 'newp', category: 'DSA' });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Project created successfully');
        });
    });
});
