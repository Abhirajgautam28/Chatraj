import request from 'supertest';
import app from '../../app.js';
import * as projectService from '../../services/project.service.js';
import jwt from 'jsonwebtoken';

jest.mock('../../services/project.service.js');
jest.mock('../../services/redis.service.js');

describe('Project Controller', () => {
    const mockToken = jwt.sign({ _id: 'user123', email: 'test@example.com' }, process.env.JWT_SECRET || 'secret');

    describe('GET /api/projects/all', () => {
        test('should return projects for the user', async () => {
            projectService.getUserProjects.mockResolvedValue([{ name: 'Project 1' }]);
            const res = await request(app)
                .get('/api/projects/all')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.projects).toHaveLength(1);
        });

        test('should return 401 if user not found', async () => {
            projectService.getUserProjects.mockRejectedValue(new Error('User not found'));
            const res = await request(app)
                .get('/api/projects/all')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/projects/create', () => {
        test('should create a new project', async () => {
            projectService.createProject.mockResolvedValue({ name: 'newp' });
            const res = await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ name: 'newp', category: 'DSA' });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Project created successfully');
        });
    });
});
