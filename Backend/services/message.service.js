import Message from '../models/message.model.js';
import { generateResult } from './ai.service.js';
import { logger } from '../utils/logger.js';

/**
 * Handles saving a new message and checking for AI triggers.
 * @param {object} data - Message data including text, sender, and projectId.
 * @returns {Promise<object>} - The saved message.
 */
export const handleNewMessage = async (data, projectId) => {
    const messageText = data.message;
    const parentMessageId = data.parentMessageId || null;

    let savedMessage;
    try {
        savedMessage = await Message.create({
            conversationId: projectId,
            sender: data.sender,
            message: messageText,
            parentMessageId: parentMessageId,
            createdAt: new Date(),
            deliveredTo: [data.sender?._id], // Sender already has it
            readBy: [data.sender?._id]
        });
        return savedMessage;
    } catch (err) {
        logger.error("Error saving message in message service:", err);
        throw err;
    }
};

/**
 * Checks if a message should trigger an AI response and generates it if so.
 * @param {string} text - Message text.
 * @param {string} projectId - Project ID.
 * @param {string} googleApiKey - AI API key.
 * @returns {Promise<object|null>} - The AI generated message or null.
 */
export const triggerAIResponse = async (text, projectId, googleApiKey) => {
    if (!text.includes('@Chatraj')) return null;

    try {
        const prompt = text.replace('@Chatraj', '');
        const result = await generateResult(prompt, googleApiKey);

        const aiMessage = await Message.create({
            conversationId: projectId,
            sender: { _id: 'Chatraj', firstName: 'Chatraj', email: 'Chatraj' },
            message: result,
            parentMessageId: null,
            createdAt: new Date(),
            deliveredTo: [],
            readBy: []
        });

        return aiMessage;
    } catch (err) {
        logger.error("Error in AI trigger:", err);
        return {
            conversationId: projectId,
            sender: { _id: 'Chatraj', firstName: 'Chatraj', email: 'Chatraj' },
            message: JSON.stringify({ text: "I'm having some trouble thinking right now. Please try again." }),
            createdAt: new Date()
        };
    }
};
