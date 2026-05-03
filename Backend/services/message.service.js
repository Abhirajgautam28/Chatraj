import Message from '../models/message.model.js';
import projectModel from '../models/project.model.js';
import { generateResult } from './ai.service.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

export const handleNewMessage = async (data, projectId) => {
    const { message, sender, parentMessageId } = data;

    const savedMessage = await Message.create({
        conversationId: projectId,
        sender: typeof sender === 'object' ? sender._id : sender,
        message,
        parentMessageId: parentMessageId || null,
        deliveredTo: [],
        readBy: []
    });

    return savedMessage;
};

export const triggerAIResponse = async (messageText, projectId, googleApiKey) => {
    if (!messageText.includes('@Chatraj')) return null;

    const prompt = messageText.replace('@Chatraj', '').trim();
    try {
        const result = await generateResult(prompt, googleApiKey);

        const aiMessage = await Message.create({
            conversationId: projectId,
            sender: { _id: 'Chatraj', email: 'Chatraj', firstName: 'ChatRaj', lastName: 'AI' },
            message: result,
            parentMessageId: null
        });

        return aiMessage;
    } catch (err) {
        logger.error("AI trigger error:", err.message);
        return null;
    }
};
