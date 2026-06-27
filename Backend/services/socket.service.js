import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from '../models/project.model.js';
import Message from '../models/message.model.js';
import { generateResult } from './ai.service.js';
import { logger } from '../utils/logger.js';

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*'
        }
    });

    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                (socket.handshake.headers.authorization ? socket.handshake.headers.authorization.split(' ')[1] : null);
            const projectId = socket.handshake.query.projectId;

            try {
                logger.info('Socket handshake', { auth: socket.handshake.auth, query: socket.handshake.query });
            } catch (e) {}

            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                logger.warn('Socket auth failed: invalid projectId', { projectId, addr: socket.handshake.address });
                return next(new Error('Invalid projectId'));
            }

            const project = await projectModel.findById(projectId);
            if (!project) {
                logger.warn('Socket auth failed: project not found', { projectId, addr: socket.handshake.address });
                return next(new Error('Project not found'));
            }
            socket.project = project;

            if (!token) {
                logger.warn('Socket auth failed: missing token', { projectId, addr: socket.handshake.address });
                return next(new Error('Authentication error'));
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (jwtErr) {
                logger.warn('Socket auth failed: token verify error', { err: jwtErr && jwtErr.message });
                return next(new Error('Authentication error'));
            }
            socket.user = decoded;

            logger.info('Socket auth success', { socketId: socket.id, userId: socket.user._id || socket.user.id || socket.user.email, projectId: project._id.toString() });

            next();
        } catch (error) {
            next(error);
        }
    });

    io.on('connection', socket => {
        socket.roomId = socket.project._id.toString();
        socket.join(socket.roomId);
        logger.info('Socket connected', { socketId: socket.id, user: socket.user && (socket.user._id || socket.user.email), roomId: socket.roomId });

        socket.on('project-message', async data => {
            try { logger.info('Received project-message', { from: data && data.sender && (data.sender._id || data.sender.email), roomId: socket.roomId, text: (data && data.message && String(data.message).slice(0, 200)) }) } catch(e) {}
            const messageText = data.message;
            const parentMessageId = data.parentMessageId || null;
            const aiIsPresent = messageText.includes('@Chatraj');
            let savedMessage;
            try {
                savedMessage = await Message.create({
                    conversationId: socket.project._id,
                    sender: data.sender,
                    message: messageText,
                    parentMessageId: parentMessageId,
                    createdAt: new Date(),
                    deliveredTo: [],
                    readBy: []
                });
                try { logger.info('Message persisted', { messageId: savedMessage && savedMessage._id, roomId: socket.roomId }); } catch(e) {}
            } catch (err) {
                logger.error("Error saving message:", err);
                savedMessage = { ...data, createdAt: new Date().toISOString(), deliveredTo: [], readBy: [] };
            }
            io.to(socket.roomId).emit('project-message', savedMessage);
            try { logger.info('project-message emitted', { roomId: socket.roomId, emittedId: savedMessage && savedMessage._id }); } catch(e) {}

            if (aiIsPresent) {
                const prompt = messageText.replace('@Chatraj', '');
                const result = await generateResult(prompt, data.googleApiKey);
                let savedAIMessage;
                try {
                    savedAIMessage = await Message.create({
                        conversationId: socket.project._id,
                        sender: { _id: 'Chatraj', email: 'Chatraj' },
                        message: result,
                        parentMessageId: null,
                        createdAt: new Date()
                    });
                } catch (err) {
                    logger.error("Error saving AI message:", err);
                    savedAIMessage = { message: result, sender: { _id: 'Chatraj', email: 'Chatraj' }, createdAt: new Date().toISOString() };
                }
                io.to(socket.roomId).emit('project-message', savedAIMessage);
            }
        });

        socket.on('message-delivered', async ({ messageId, userId }) => {
            try {
                try { logger.info('message-delivered event', { messageId, userId, roomId: socket.roomId }); } catch(e) {}
                const result = await Message.updateOne(
                    { _id: messageId },
                    { $addToSet: { deliveredTo: userId } }
                );
                if (result.modifiedCount > 0) {
                    io.to(socket.roomId).emit('message-delivered', { messageId, userId });
                }
            } catch (err) {
                logger.error('Error updating deliveredTo:', err);
            }
        });

        socket.on('message-read', async ({ messageId, userId }) => {
            try {
                try { logger.info('message-read event', { messageId, userId, roomId: socket.roomId }); } catch(e) {}
                const result = await Message.updateOne(
                    { _id: messageId },
                    { $addToSet: { readBy: userId } }
                );
                if (result.modifiedCount > 0) {
                    io.to(socket.roomId).emit('message-read', { messageId, userId });
                }
            } catch (err) {
                logger.error('Error updating readBy:', err);
            }
        });

        socket.on('message-reaction', async (data) => {
            try {
                const message = await Message.findById(data.messageId);
                if (message) {
                    message.reactions = message.reactions.filter(r =>
                        r.userId.toString() !== data.userId.toString()
                    );

                    if (data.emoji) {
                        message.reactions.push({
                            emoji: data.emoji,
                            userId: data.userId
                        });
                    }

                    await message.save();
                    io.to(socket.roomId).emit('message-reaction', message);
                }
            } catch (error) {
                logger.error("Error handling reaction:", error.message);
            }
        });

        socket.on('typing', (data) => {
            try { logger.debug('typing event', { from: data && data.userId, roomId: socket.roomId }); } catch(e) {}
            socket.to(socket.roomId).emit('typing', {
                userId: data.userId,
                projectId: data.projectId
            });
        });

        socket.on('stop-typing', (data) => {
            try { logger.debug('stop-typing event', { from: data && data.userId, roomId: socket.roomId }); } catch(e) {}
            socket.to(socket.roomId).emit('stop-typing', {
                userId: data.userId,
                projectId: data.projectId
            });
        });

        socket.on('disconnect', () => {
            logger.info('user disconnected');
            socket.leave(socket.roomId);
        });
    });

    return io;
};
