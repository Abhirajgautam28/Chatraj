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
import { generateResult } from './services/ai.service.js';
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

        // Identity Migration Fallback
        if (!decoded._id) {
            const user = await userModel.findOne({ email: decoded.email }).select('_id').lean();
            if (!user) return next(new Error('User not found'));
            decoded._id = user._id;
        }
        socket.user = decoded;

        const project = await projectModel.findOne({ _id: projectId, users: decoded._id }).lean();
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
                const result = await generateResult(prompt, data.googleApiKey || socket.user.googleApiKey);

                const aiMessage = await Message.create({
                    conversationId: socket.project._id,
                    sender: { _id: 'Chatraj', email: 'Chatraj', firstName: 'Chat', lastName: 'Raj' },
                    message: result
                });
                io.to(roomId).emit('project-message', aiMessage);
            }
        } catch (err) {
            console.error("[SOCKET] Message Error:", err);
        }
    });

    socket.on('message-delivered', async ({ messageId }) => {
        await Message.updateOne({ _id: messageId }, { $addToSet: { deliveredTo: socket.user._id } });
        socket.volatile.to(roomId).emit('message-delivered', { messageId, userId: socket.user._id });
    });

    socket.on('message-read', async ({ messageId }) => {
        await Message.updateOne({ _id: messageId }, { $addToSet: { readBy: socket.user._id } });
        socket.volatile.to(roomId).emit('message-read', { messageId, userId: socket.user._id });
    });

    socket.on('message-reaction', async (data) => {
        try {
            await Message.updateOne(
                { _id: data.messageId },
                { $pull: { reactions: { userId: socket.user._id } } }
            );

            if (data.emoji) {
                const updated = await Message.findOneAndUpdate(
                    { _id: data.messageId },
                    { $push: { reactions: { emoji: data.emoji, userId: socket.user._id } } },
                    { new: true, lean: true }
                );
                io.to(roomId).emit('message-reaction', updated);
            }
        } catch (error) {
            console.error("Reaction Error:", error);
        }
    });

    socket.on('typing', () => {
        socket.volatile.to(roomId).emit('typing', { userId: socket.user._id });
    });

    socket.on('stop-typing', () => {
        socket.volatile.to(roomId).emit('stop-typing', { userId: socket.user._id });
    });

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
