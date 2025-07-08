import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';
import Message from './models/message.model.js';
import pingService from './services/ping.service.js';

const port = process.env.PORT || 8080;

const server = http.createServer(app);
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
})

io.on('connection', socket => {
    socket.roomId = socket.project._id.toString()
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
                deliveredTo: [], // Track delivery
                readBy: [] // Track reads
            });
        } catch (err) {
            console.error("Error saving message:", err);
            savedMessage = { ...data, createdAt: new Date().toISOString(), deliveredTo: [], readBy: [] };
        }
        io.to(socket.roomId).emit('project-message', savedMessage);

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
            io.to(socket.roomId).emit('project-message', savedAIMessage);
            return;
        }
    })

    // Delivery event: when a user receives a message, mark as delivered
    socket.on('message-delivered', async ({ messageId, userId }) => {
        try {
            const message = await Message.findById(messageId);
            if (message && !message.deliveredTo.includes(userId)) {
                message.deliveredTo.push(userId);
                await message.save();
                io.to(socket.roomId).emit('message-delivered', { messageId, userId });
            }
        } catch (err) {
            console.error('Error updating deliveredTo:', err);
        }
    });

    // Read event: when a user reads a message, mark as read
    socket.on('message-read', async ({ messageId, userId }) => {
        try {
            const message = await Message.findById(messageId);
            if (message && !message.readBy.includes(userId)) {
                message.readBy.push(userId);
                await message.save();
                io.to(socket.roomId).emit('message-read', { messageId, userId });
            }
        } catch (err) {
            console.error('Error updating readBy:', err);
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
            console.error("Error handling reaction:", error.message);
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