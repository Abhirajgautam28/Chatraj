import request from 'supertest';
import app from '../../app.js';
import * as projectService from '../../services/project.service.js';

jest.mock('../../services/project.service.js');
jest.mock('../../db/db.js');

describe('Project Controller', () => {
    const token = 'valid_token';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/projects/all success', async () => {
        projectService.getUserProjects.mockResolvedValue([]);
        const res = await request(app)
            .get('/api/projects/all')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.projects).toBeDefined();
    });

    test('POST /api/projects/create success', async () => {
        projectService.createProject.mockResolvedValue({ name: 'p1' });
        const res = await request(app)
            .post('/api/projects/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'p1', category: 'Web' });
        expect(res.status).toBe(201);
    });
});
