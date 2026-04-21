import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from '../models/project.model.js';
import Message from '../models/message.model.js';
import { logger } from '../utils/logger.js';
import * as messageService from './message.service.js';

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

            const project = await projectModel.findById(projectId);
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
            try {
                const savedMessage = await messageService.handleNewMessage(data, socket.project._id);
                io.to(socket.roomId).emit('project-message', savedMessage);

                const aiMessage = await messageService.triggerAIResponse(data.message, socket.project._id, data.googleApiKey);
                if (aiMessage) {
                    io.to(socket.roomId).emit('project-message', aiMessage);
                }
            } catch (err) {
                logger.error("Socket project-message error:", err.message);
                // Fallback for UI if DB fails but socket is alive
                io.to(socket.roomId).emit('project-message', {
                    ...data,
                    _id: new mongoose.Types.ObjectId(),
                    createdAt: new Date()
                });
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
