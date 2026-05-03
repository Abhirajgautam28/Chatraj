import request from 'supertest';
import app from '../../app.js';
import * as userService from '../../services/user.service.js';

jest.mock('../../services/user.service.js');
jest.mock('../../db/db.js');

describe('User Controller', () => {
    test('POST /api/users/login success', async () => {
        userService.loginUser.mockResolvedValue({ token: 't', user: {} });
        const res = await request(app).post('/api/users/login').send({ email: 't@e.com', password: 'pass' });
        expect(res.status).toBe(200);
    });

    test('POST /api/users/login fail', async () => {
        userService.loginUser.mockRejectedValue(new Error('Invalid credentials'));
        const res = await request(app).post('/api/users/login').send({ email: 't@e.com', password: 'pass' });
        expect(res.status).toBe(400);
    });
});
