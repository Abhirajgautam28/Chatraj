import { initializeSocket } from '../../../services/socket.service.js';
import { Server } from 'socket.io';
import projectModel from '../../../models/project.model.js';
import jwt from 'jsonwebtoken';

jest.mock('socket.io');
jest.mock('../../../models/project.model.js');
jest.mock('../../../services/redis.service.js');

describe('Socket Service', () => {
    let mockServer, mockIo;

    beforeEach(() => {
        mockServer = {};
        mockIo = {
            use: jest.fn(),
            on: jest.fn(),
            to: jest.fn().mockReturnThis(),
            emit: jest.fn()
        };
        Server.mockImplementation(() => mockIo);
    });

    test('initializeSocket should setup io and middleware', () => {
        const io = initializeSocket(mockServer);
        expect(Server).toHaveBeenCalledWith(mockServer, expect.anything());
        expect(mockIo.use).toHaveBeenCalled();
        expect(mockIo.on).toHaveBeenCalledWith('connection', expect.anything());
        expect(io).toBe(mockIo);
    });

    test('middleware should reject invalid projectId', async () => {
        initializeSocket(mockServer);
        const middleware = mockIo.use.mock.calls[0][0];
        const socket = { handshake: { query: { projectId: 'invalid' }, headers: { authorization: 'Bearer token' }, auth: {} } };
        const next = jest.fn();

        await middleware(socket, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid projectId' }));
    });
});
