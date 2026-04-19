import request from 'supertest';
import app from '../app.js';
import Newsletter from '../models/newsletter.model.js';

jest.mock('../models/newsletter.model.js');
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
    })
}));
jest.mock('../db/db.js');

describe('Newsletter Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should subscribe a new email', async () => {
        const email = 'new@example.com';
        Newsletter.findOne.mockResolvedValue(null);
        Newsletter.create.mockResolvedValue({ email });

        const res = await request(app)
            .post('/api/newsletter/subscribe')
            .send({ email });

        expect(res.status).toBe(201);
        expect(res.body.message).toContain('Subscribed successfully');
    });

    test('should return 409 if already subscribed', async () => {
        const email = 'existing@example.com';
        Newsletter.findOne.mockResolvedValue({ email });

        const res = await request(app)
            .post('/api/newsletter/subscribe')
            .send({ email });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Email already subscribed.');
    });

    test('should return 400 for invalid email', async () => {
        const res = await request(app)
            .post('/api/newsletter/subscribe')
            .send({ email: 'invalid-email' });

        expect(res.status).toBe(400);
    });
});
