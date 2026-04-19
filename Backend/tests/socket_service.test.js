import { initializeSocket } from '../services/socket.service.js';
import http from 'http';
import { io as ioc } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from '../models/project.model.js';

jest.mock('../models/project.model.js');
jest.mock('../models/message.model.js');
jest.mock('../services/ai.service.js');

describe('Socket Service', () => {
    let io, server, clientSocket, port;
    const mockUser = { _id: new mongoose.Types.ObjectId().toString(), email: 'u@e.com' };
    const mockProject = { _id: new mongoose.Types.ObjectId().toString(), name: 'P1' };
    const token = jwt.sign(mockUser, 'secret');

    beforeAll((done) => {
        process.env.JWT_SECRET = 'secret';
        server = http.createServer();

        projectModel.findById.mockResolvedValue(mockProject);

        io = initializeSocket(server);

        server.listen(() => {
            port = server.address().port;
            clientSocket = ioc(`http://localhost:${port}`, {
                auth: { token },
                query: { projectId: mockProject._id }
            });
            clientSocket.on('connect', done);
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.disconnect();
        server.close();
    });

    test('should join room on connection', () => {
        // Handled by beforeAll done.
        expect(clientSocket.connected).toBe(true);
    });

    test('should broadcast typing event', (done) => {
        clientSocket.on('typing', (data) => {
            expect(data.userId).toBe(mockUser._id);
            done();
        });
        clientSocket.emit('typing', { userId: mockUser._id, projectId: mockProject._id });
    });
});
