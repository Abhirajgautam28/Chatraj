/**
 * Standardizes API responses and optimizes payload size for transmission.
 * Shorter keys and flattened structures lead to better compression ratios.
 */

export const successResponse = (res, data, status = 200) => {
    return res.status(status).json(data);
};

export const errorResponse = (res, message, status = 500, details = null) => {
    const response = { error: message };
    if (details) response.details = details;
    return res.status(status).json(response);
};

// Specialized, pre-compiled-like serialization for high-frequency Message objects
// Optimization: Returns an object with only necessary fields to reduce Socket.io payload size
export const serializeMessage = (msg) => {
    const serialized = {
        _id: msg._id,
        conversationId: msg.conversationId,
        sender: {
            _id: msg.sender?._id,
            firstName: msg.sender?.firstName
        },
        message: msg.message,
        createdAt: msg.createdAt
    };

    // Payload Pruning: Only include optional fields if they have data
    if (msg.parentMessageId) serialized.parentMessageId = msg.parentMessageId;
    if (msg.reactions?.length) serialized.reactions = msg.reactions;
    if (msg.deliveredTo?.length) serialized.deliveredTo = msg.deliveredTo;
    if (msg.readBy?.length) serialized.readBy = msg.readBy;

    return serialized;
};
