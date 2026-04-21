import http from 'http';
import 'dotenv/config';
import './patches/patch-validator-isURL.js';
import app from './app.js';
import connect from './db/db.js';
import redisClient from './services/redis.service.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';
import { withCache } from './utils/cache.js';
import { serializeMessage } from './utils/response.js';
import Message from './models/message.model.js';
import pingService from './services/ping.service.js';


const port = process.env.PORT || 8080;

// Enforce presence of critical environment variables in production-like runs.
// In development/test we emit a warning so local workflows remain ergonomic.
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
    const enforce = process.env.NODE_ENV === 'production' || process.env.ENFORCE_REQUIRED_ENV === 'true';
    const msg = `Missing required environment variables: ${missing.join(', ')}. Please set them in your .env file or host environment before starting.`;
    if (enforce) {
        console.error(msg);
        process.exit(1);
    } else {
        console.warn(`${msg} Continuing because NODE_ENV !== 'production'. Set ENFORCE_REQUIRED_ENV=true to enforce in non-production environments.`);
    }
}

connect().catch(console.error);

const server = http.createServer(app);

// Node.js Runtime performance tuning
server.keepAliveTimeout = 65000; // Slightly higher than LB timeout
server.headersTimeout = 66000;
const io = new Server(server, {
    cors: {
        origin: '*'
    },
    // Enable per-message compression for high-volume chat data
    perMessageDeflate: {
        threshold: 1024, // only compress messages > 1kb
        zlibDeflateOptions: {
            chunkSize: 8 * 1024,
        },
        zlibInflateOptions: {
            windowBits: 14,
        },
    },
    // Faster detection of dead clients to free up server resources
    pingTimeout: 10000,
    pingInterval: 5000,
    // Connect timeout
    connectTimeout: 20000
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

        // Cache project metadata for 10 seconds to throttle DB lookups during rapid reconnections
        const project = await withCache(`project:socket:${projectId}`, 10, async () => {
            return await projectModel.findById(projectId).lean();
        });

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
})

io.on('connection', socket => {
    socket.roomId = socket.project._id.toString()
    socket.join(socket.roomId);

    socket.on('project-message', async data => {
        // Message deduplication for cluster mode / client retries
        if (data.msgId) {
            const isDuplicate = await redisClient.set(`msg:dedup:${data.msgId}`, '1', 'NX', 'EX', 3600);
            if (!isDuplicate) return;
        }

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
                deliveredTo: [data.sender._id], // Sender automatically has it 'delivered'
                readBy: [data.sender._id] // Sender automatically has it 'read'
            });
        } catch (err) {
            console.error("Error saving message:", err);
            savedMessage = { ...data, createdAt: new Date().toISOString(), deliveredTo: [], readBy: [] };
        }

        io.to(socket.roomId).emit('project-message', serializeMessage(savedMessage));

        if (aiIsPresent) {
            const prompt = messageText.replace('@Chatraj', '');
            // Pass googleApiKey from data to generateResult
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
                console.error("Error saving AI message:", err);
                savedAIMessage = { message: result, sender: { _id: 'Chatraj', email: 'Chatraj' }, createdAt: new Date().toISOString() };
            }
            io.to(socket.roomId).emit('project-message', serializeMessage(savedAIMessage));
            return;
        }
    })

    // Delivery event: when a user receives a message, mark as delivered
    socket.on('message-delivered', async ({ messageId, userId }) => {
        try {
            const result = await Message.updateOne(
                { _id: messageId, deliveredTo: { $ne: userId } },
                { $addToSet: { deliveredTo: userId } }
            );
            if (result.modifiedCount > 0) {
                io.to(socket.roomId).emit('message-delivered', { messageId, userId });
            }
        } catch (err) {
            console.error('Error updating deliveredTo:', err);
        }
    });

    // Performance Optimization: Batch delivery status updates
    socket.on('messages-delivered-batch', async ({ messageIds, userId }) => {
        try {
            const result = await Message.updateMany(
                { _id: { $in: messageIds }, deliveredTo: { $ne: userId } },
                { $addToSet: { deliveredTo: userId } }
            );
            if (result.modifiedCount > 0) {
                io.to(socket.roomId).emit('messages-delivered-batch', { messageIds, userId });
            }
        } catch (err) {
            console.error('Error updating deliveredTo batch:', err);
        }
    });

    // Read event: when a user reads a message, mark as read
    socket.on('message-read', async ({ messageId, userId }) => {
        try {
            const result = await Message.updateOne(
                { _id: messageId, readBy: { $ne: userId } },
                { $addToSet: { readBy: userId } }
            );
            if (result.modifiedCount > 0) {
                io.to(socket.roomId).emit('message-read', { messageId, userId });
            }
        } catch (err) {
            console.error('Error updating readBy:', err);
        }
    });

    // Performance Optimization: Batch read status updates
    socket.on('messages-read-batch', async ({ messageIds, userId }) => {
        try {
            const result = await Message.updateMany(
                { _id: { $in: messageIds }, readBy: { $ne: userId } },
                { $addToSet: { readBy: userId } }
            );
            if (result.modifiedCount > 0) {
                io.to(socket.roomId).emit('messages-read-batch', { messageIds, userId });
            }
        } catch (err) {
            console.error('Error updating readBy batch:', err);
        }
    });

    socket.on('message-reaction', async (data) => {
        try {
            // Optimization: Single atomic update for toggle (Pull then Push if emoji exists)
            // To ensure strict atomicity and avoid two round-trips:
            // 1. Pull the user's existing reaction
            // 2. If data.emoji is provided, Push the new one

            // In MongoDB, we can't do $pull and $push on the same field in one update.
            // But we can $set a filtered array.
            // Optimized logic:
            const update = {
                $pull: { reactions: { userId: data.userId } }
            };

            await Message.updateOne({ _id: data.messageId }, update);

            let finalMessage;
            if (data.emoji) {
                finalMessage = await Message.findOneAndUpdate(
                    { _id: data.messageId },
                    { $push: { reactions: { emoji: data.emoji, userId: data.userId } } },
                    { new: true }
                ).lean();
            } else {
                finalMessage = await Message.findById(data.messageId).lean();
            }

            if (finalMessage) {
                io.to(socket.roomId).emit('message-reaction', finalMessage);
            }
        } catch (error) {
            console.error("Error handling reaction:", error.message);
        }
    });

    socket.on('typing', (data) => {
        // Optimization: Volatile events for high-frequency ephemeral state
        socket.to(socket.roomId).volatile.emit('typing', {
            userId: data.userId,
            projectId: data.projectId
        });
    });

    socket.on('stop-typing', (data) => {
        socket.to(socket.roomId).volatile.emit('stop-typing', {
            userId: data.userId,
            projectId: data.projectId
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId)
    });
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please try these solutions:`);
        console.log('1. Stop any running server instances');
        console.log('2. Choose a different port in .env file');
        console.log('3. Run: taskkill /F /IM node.exe to force stop all Node processes');
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    if (process.env.NODE_ENV === 'production') {
        const backendUrl = process.env.BACKEND_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
        pingService(`${backendUrl}/health`);
    }
});