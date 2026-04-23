import Message from '../models/message.model.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';
import * as messageService from './message.service.js';

/**
 * Service to handle Socket.io logic, separating it from the server setup.
 */
export const handleSocketConnection = (io, socket) => {
    socket.roomId = socket.project._id.toString();
    socket.join(socket.roomId);

    socket.on('project-message', async data => {
        const savedMessage = await messageService.saveMessage({
            conversationId: socket.project._id,
            sender: socket.user,
            message: data.message,
            parentMessageId: data.parentMessageId
        });

        io.to(socket.roomId).emit('project-message', savedMessage);

        const aiMessage = await messageService.handleAiTrigger({
            conversationId: socket.project._id,
            messageText: data.message,
            googleApiKey: data.googleApiKey
        });

        if (aiMessage) {
            io.to(socket.roomId).emit('project-message', aiMessage);
        }
    });

    socket.on('message-delivered', async ({ messageId, userId }) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(messageId)) return;
            const res = await Message.updateOne(
                { _id: messageId },
                { $addToSet: { deliveredTo: userId } }
            );
            if (res.modifiedCount > 0) {
                io.to(socket.roomId).emit('message-delivered', { messageId, userId });
            }
        } catch (err) {
            logger.error('Error updating deliveredTo:', err);
        }
    });

    socket.on('message-read', async ({ messageId, userId }) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(messageId)) return;
            const res = await Message.updateOne(
                { _id: messageId },
                { $addToSet: { readBy: userId } }
            );
            if (res.modifiedCount > 0) {
                io.to(socket.roomId).emit('message-read', { messageId, userId });
            }
        } catch (err) {
            logger.error('Error updating readBy:', err);
        }
    });

    socket.on('message-reaction', async (data) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(data.messageId)) return;

            await Message.updateOne(
                { _id: data.messageId },
                { $pull: { reactions: { userId: data.userId } } }
            );

            if (data.emoji) {
                await Message.updateOne(
                    { _id: data.messageId },
                    { $push: { reactions: { emoji: data.emoji, userId: data.userId } } }
                );
            }

            const updatedMessage = await Message.findById(data.messageId);
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
};
