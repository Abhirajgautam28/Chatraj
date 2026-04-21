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
                socket.handshake.headers.authorization?.split(' ')[1];
            const projectId = socket.handshake.query.projectId;

            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                return next(new Error('Invalid projectId'));
            }

            const project = await projectModel.findById(projectId).lean();
            if (!project) {
                return next(new Error('Project not found'));
            }
            socket.project = project;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return next(new Error('Authentication error'));
            }
            socket.user = decoded;

            next();
        } catch (error) {
            next(error);
        }
    });

    io.on('connection', socket => {
        socket.roomId = socket.project._id.toString();
        socket.join(socket.roomId);

        socket.on('project-message', async data => {
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
            } catch (err) {
                logger.error("Error saving message:", err);
                savedMessage = { ...data, createdAt: new Date().toISOString(), deliveredTo: [], readBy: [] };
            }
            io.to(socket.roomId).emit('project-message', savedMessage);

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
                // Use atomic toggle pattern for reactions
                const pullRes = await Message.updateOne(
                    { _id: data.messageId, 'reactions.userId': data.userId },
                    { $pull: { reactions: { userId: data.userId } } }
                );

                if (data.emoji) {
                    await Message.updateOne(
                        { _id: data.messageId },
                        { $push: { reactions: { emoji: data.emoji, userId: data.userId } } }
                    );
                }

                const updatedMessage = await Message.findById(data.messageId).lean();
                if (updatedMessage) {
                    io.to(socket.roomId).emit('message-reaction', updatedMessage);
                }
            } catch (error) {
                logger.error("Error handling reaction:", error.message);
            }
        });

        socket.on('typing', (data) => {
            socket.to(socket.roomId).emit('typing', {
                userId: data.userId,
                projectId: data.projectId
            });
        });

        socket.on('stop-typing', (data) => {
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
