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

    describe('GET /api/users/leaderboard', () => {
        test('success', async () => {
            const users = [{ _id: '1', firstName: 'A', lastName: 'B', points: 10 }];
            userService.getLeaderboard.mockResolvedValue(users);
            const res = await request(app).get('/api/users/leaderboard');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.users).toEqual(users);
        });

        test('fail - internal server error', async () => {
            userService.getLeaderboard.mockRejectedValue(new Error('DB error'));
            const res = await request(app).get('/api/users/leaderboard');
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Internal server error');
        });
    });
});
