import mongoose from 'mongoose';
import Message from '../models/message.model.js';

describe('Message Model', () => {
    test('should create a valid message object', () => {
        const conversationId = new mongoose.Types.ObjectId();
        const messageData = {
            conversationId,
            sender: 'user123',
            message: 'Hello world'
        };
        const msg = new Message(messageData);

        expect(msg.conversationId).toBe(conversationId);
        expect(msg.sender).toBe('user123');
        expect(msg.message).toBe('Hello world');
        expect(msg.reactions).toEqual([]);
    });

    test('should fail if required fields are missing', () => {
        const msg = new Message({});
        const err = msg.validateSync();
        expect(err.errors.conversationId).toBeDefined();
        expect(err.errors.sender).toBeDefined();
        expect(err.errors.message).toBeDefined();
    });
});
