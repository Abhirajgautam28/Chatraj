import { Server } from 'socket.io';
import { io as ioc } from 'socket.io-client';
import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from '../models/project.model.js';
import Message from '../models/message.model.js';
import { generateResult } from '../services/ai.service.js';

jest.mock('../models/project.model.js');
jest.mock('../models/message.model.js');
jest.mock('../services/ai.service.js');

describe('Socket.io Integration', () => {
    let io, server, clientSocket, port;
    const mockUser = { _id: 'u123', email: 'u@e.com' };
    const mockProject = { _id: new mongoose.Types.ObjectId().toString(), name: 'P1' };
    const token = jwt.sign(mockUser, 'secret');

    beforeAll((done) => {
        process.env.JWT_SECRET = 'secret';
        server = http.createServer();
        io = new Server(server);

        // Mock middleware logic from server.js
        io.use((socket, next) => {
            const t = socket.handshake.auth.token;
            const pId = socket.handshake.query.projectId;
            if (t === token && pId === mockProject._id) {
                socket.user = mockUser;
                socket.project = { _id: pId };
                return next();
            }
            next(new Error('Auth failed'));
        });

        io.on('connection', (socket) => {
            socket.roomId = socket.project._id.toString();
            socket.join(socket.roomId);
            socket.on('project-message', async (data) => {
                const saved = { ...data, _id: 'm123' };
                Message.create.mockResolvedValue(saved);
                io.to(socket.roomId).emit('project-message', saved);
            });
        });

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

    test('should communicate via socket', (done) => {
        const testMsg = { message: 'hello', sender: mockUser };
        clientSocket.emit('project-message', testMsg);
        clientSocket.on('project-message', (data) => {
            expect(data.message).toBe('hello');
            done();
        });
    });
});
