import Message from '../models/message.model.js';
import { logger } from '../utils/logger.js';
import { generateResult } from './ai.service.js';

export const saveMessage = async ({ conversationId, sender, message, parentMessageId }) => {
  try {
    return await Message.create({
      conversationId,
      sender,
      message,
      parentMessageId,
      deliveredTo: [],
      readBy: [],
      createdAt: new Date()
    });
  } catch (err) {
    logger.error("Error saving message:", err);
    return {
      conversationId,
      sender,
      message,
      parentMessageId,
      createdAt: new Date().toISOString(),
      deliveredTo: [],
      readBy: []
    };
  }
};

export const handleAiTrigger = async ({ conversationId, messageText, googleApiKey }) => {
  if (!messageText.includes('@Chatraj')) return null;

  const prompt = messageText.replace('@Chatraj', '');
  const result = await generateResult(prompt, googleApiKey);

  try {
    return await Message.create({
      conversationId,
      sender: { _id: 'Chatraj', email: 'Chatraj' },
      message: result,
      parentMessageId: null,
      createdAt: new Date()
    });
  } catch (err) {
    logger.error("Error saving AI message:", err);
    return {
      message: result,
      sender: { _id: 'Chatraj', email: 'Chatraj' },
      createdAt: new Date().toISOString()
    };
  }
};
