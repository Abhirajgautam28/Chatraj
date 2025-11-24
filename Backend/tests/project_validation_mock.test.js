
import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import { authUser } from '../middleware/auth.middleware.js';

// Mock the dependencies
jest.mock('../models/user.model.js', () => ({
    findOne: jest.fn()
}));
jest.mock('../models/project.model.js', () => ({
    create: jest.fn(),
    find: jest.fn()
}));
jest.mock('../middleware/auth.middleware.js', () => ({
    authUser: (req, res, next) => {
        req.user = { email: 'test@example.com', _id: 'userId123' };
        next();
    }
}));

import projectRoutes from '../routes/project.routes.js';
import userModel from '../models/user.model.js';
import projectModel from '../models/project.model.js';

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

describe('Project Creation Validation', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        userModel.findOne.mockResolvedValue({ _id: 'userId123', email: 'test@example.com' });
    });

    it('should fail with 400 when users is not an array (if validation exists)', async () => {
        // Mock create to throw error if called with invalid users, simulating Mongoose behavior
        projectModel.create.mockImplementation(() => {
             throw new Error('Mongoose cast error');
        });

        const res = await request(app)
            .post('/api/projects/create')
            .send({
                name: 'test-project',
                category: 'Web',
                users: 'not-an-array'
            });

        if (res.status === 500) {
            console.log("Test failed (Bug reproduced): Got 500 Server Error");
        } else if (res.status === 400) {
            console.log("Got 400 Bad Request (Validation working)");
        } else {
            console.log("Got status:", res.status);
        }

        expect(res.status).toBe(400);
        // Should have errors array
        expect(res.body.errors).toBeDefined();
    });

    it('should fail with 400 when category is missing', async () => {
        projectModel.create.mockResolvedValue({});

        const res = await request(app)
            .post('/api/projects/create')
            .send({
                name: 'test-project-2',
                // category missing
                users: []
            });

        expect(res.status).toBe(400);
        // Now expecting errors array from express-validator
        expect(res.body.errors).toBeDefined();
        const categoryError = res.body.errors.find(e => e.path === 'category');
        // express-validator v7 might use 'path' or 'param'. v7 uses 'path'?
        // The output showed 'param' in older versions. Let's check.
        // Or just check if string 'Category is required' exists in response text
        const text = JSON.stringify(res.body);
        expect(text).toMatch(/Category is required/);
    });
});
