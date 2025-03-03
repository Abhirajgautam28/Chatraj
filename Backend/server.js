import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';
import Message from './models/message.model.js';

const port = process.env.PORT || 3000;

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
    // console.log('a user connected');
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
                createdAt: new Date()
            });
        } catch (err) {
            console.error("Error saving message:", err);
            savedMessage = { ...data, createdAt: new Date().toISOString() };
        }
        io.to(socket.roomId).emit('project-message', savedMessage);

        if (aiIsPresent) {
            const prompt = messageText.replace('@Chatraj', '');
            const result = await generateResult(prompt);
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

    socket.on('message-reaction', async (data) => {
        try {
            const message = await Message.findById(data.messageId);
            if (message) {
                if (!message.reactions.some(r => r.userId.toString() === data.userId.toString() && r.emoji === data.emoji)) {
                    message.reactions.push({ emoji: data.emoji, userId: data.userId });
                }
                await message.save();
                io.to(socket.roomId).emit('project-message', message);
            }
        } catch (error) {
            console.error("Error handling reaction:", error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId)
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})