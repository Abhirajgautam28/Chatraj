
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

// Mock the user model and DB

jest.mock('../models/user.model.js', () => {
  return {
    __esModule: true,
    default: {
      findOne: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnValue(null)
      }))
    }
  };
});


// Mock mongoose connect to avoid real DB connection
jest.mock('../db/db.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock Redis service to prevent real Redis connections and open handle warnings
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

describe('User API', () => {
  it('should return 401 for invalid login', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'fake@example.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });
});
