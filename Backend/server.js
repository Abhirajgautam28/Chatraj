import http from 'http';
import 'dotenv/config';
import './patches/patch-validator-isURL.js';
import app from './app.js';
import connect from './db/db.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import userModel from './models/user.model.js';
import { generateResult, generateResultStream } from './services/ai.service.js';
import Message from './models/message.model.js';
import pingService from './services/ping.service.js';

const port = process.env.PORT || 8080;

connect().catch(console.error);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    perMessageDeflate: true,
    maxHttpBufferSize: 1e7
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) return next(new Error('Invalid projectId'));
        if (!token) return next(new Error('Authentication error'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded._id) {
            const user = await userModel.findOne({ email: decoded.email }).select('_id').lean();
            if (!user) return next(new Error('User not found'));
            decoded._id = user._id;
        }
        socket.user = decoded;

        const project = await projectModel.findOne({ _id: projectId, users: decoded._id }).select('_id').lean();
        if (!project) return next(new Error('Access Denied'));
        socket.project = project;

        next();
    } catch (error) {
        next(error);
    }
});

io.on('connection', socket => {
    const roomId = socket.project._id.toString();
    socket.join(roomId);

    socket.on('project-message', async data => {
        const aiIsPresent = data.message.includes('@Chatraj');

        try {
            const savedMessage = await Message.create({
                conversationId: socket.project._id,
                sender: { _id: socket.user._id, email: socket.user.email, firstName: socket.user.firstName, lastName: socket.user.lastName },
                message: data.message,
                parentMessageId: data.parentMessageId || null
            });

            io.to(roomId).emit('project-message', savedMessage);

            if (aiIsPresent) {
                const prompt = data.message.replace('@Chatraj', '');
                const aiMsgId = new mongoose.Types.ObjectId();

                // Immediate placeholder for AI response to enable streaming UI
                io.to(roomId).emit('ai-stream-start', { _id: aiMsgId, conversationId: socket.project._id });

                let fullResponse = "";
                await generateResultStream(prompt, data.googleApiKey || socket.user.googleApiKey, (chunk) => {
                    fullResponse += chunk;
                    io.to(roomId).emit('ai-stream-chunk', { _id: aiMsgId, chunk });
                });

                // Persist final message
                const aiMessage = await Message.create({
                    _id: aiMsgId,
                    conversationId: socket.project._id,
                    sender: { _id: 'Chatraj', email: 'Chatraj', firstName: 'Chat', lastName: 'Raj' },
                    message: fullResponse
                });

                io.to(roomId).emit('ai-stream-end', aiMessage);
            }
        } catch (err) {
            console.error("[SOCKET] Message Error:", err);
        }
    });

    socket.on('batch-delivered', async (messageIds) => {
        await Message.updateMany({ _id: { $in: messageIds } }, { $addToSet: { deliveredTo: socket.user._id } });
        socket.volatile.to(roomId).emit('batch-delivered', { messageIds, userId: socket.user._id });
    });

    socket.on('batch-read', async (messageIds) => {
        await Message.updateMany({ _id: { $in: messageIds } }, { $addToSet: { readBy: socket.user._id } });
        socket.volatile.to(roomId).emit('batch-read', { messageIds, userId: socket.user._id });
    });

    socket.on('typing', () => socket.volatile.to(roomId).emit('typing', { userId: socket.user._id }));
    socket.on('stop-typing', () => socket.volatile.to(roomId).emit('stop-typing', { userId: socket.user._id }));

    socket.on('disconnect', () => {
        socket.leave(roomId);
    });
});

server.listen(port, () => {
    console.log(`Server running on ${port}`);
    if (process.env.NODE_ENV === 'production') {
        const backendUrl = process.env.BACKEND_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
        pingService(`${backendUrl}/health`);
    }
});
