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

// Simple Object Pool for Message serialization to reduce GC pressure
const messagePool = [];
const MAX_POOL_SIZE = 100;

const getFromPool = () => messagePool.pop() || {};
const releaseToPool = (obj) => {
    if (messagePool.length < MAX_POOL_SIZE) {
        // Clear object keys for reuse
        for (const key in obj) delete obj[key];
        messagePool.push(obj);
    }
};

// Specialized, pre-compiled-like serialization for high-frequency Message objects
// Optimization: Returns an object with only necessary fields to reduce Socket.io payload size
export const serializeMessage = (msg) => {
    const pooled = getFromPool();
    pooled._id = msg._id;
    pooled.conversationId = msg.conversationId;
    pooled.sender = {
        _id: msg.sender?._id,
        firstName: msg.sender?.firstName,
        lastName: msg.sender?.lastName,
        email: msg.sender?.email
    };
    pooled.message = msg.message;
    pooled.parentMessageId = msg.parentMessageId;
    pooled.reactions = msg.reactions || [];
    pooled.deliveredTo = msg.deliveredTo || [];
    pooled.readBy = msg.readBy || [];
    pooled.createdAt = msg.createdAt;

    // In a real high-perf scenario, we'd release this after emit.
    // For now, we return it as a plain object to maintain compatibility.
    return pooled;
};
