export const sanitizeIframeUrl = (rawValue) => {
    if (!rawValue) return null;
    try {
        const url = new URL(rawValue, window.location.origin);
        if (url.origin !== window.location.origin) {
            return null;
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return null;
        }
        return url.toString();
    } catch {
        return null;
    }
};

export const normalizeFileTree = (tree) => {
    if (!tree || typeof tree !== 'object') return {};
    const normalized = {};
    for (const [key, value] of Object.entries(tree)) {
        if (value && typeof value === 'object' && 'file' in value && typeof value.file.contents === 'string') {
            normalized[key] = value;
        } else if (typeof value === 'string') {
            normalized[key] = { file: { contents: value } };
        }
    }
    return normalized;
};

export const deduplicateMessages = (messages) => {
    const seen = new Set();
    return messages.filter((msg) => {
        if (!msg || typeof msg !== 'object') return false;

        const identity = msg._id || msg.id || getMessageIdentity(msg);
        if (!identity) return true;
        if (seen.has(identity)) return false;
        seen.add(identity);
        return true;
    });
};

const getMessageIdentity = (msg) => {
    if (!msg || typeof msg !== 'object') return null;
    const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
    const senderName = typeof msg.sender === 'object' ? `${msg.sender?.firstName || ''}${msg.sender?.lastName || ''}` : msg.sender;
    const normalizedText = typeof msg.message === 'string' ? msg.message.trim() : '';
    const createdAt = msg.createdAt || msg.timestamp || '';
    if (!normalizedText) return null;
    return `${senderId || senderName || 'unknown'}::${normalizedText}::${createdAt}`;
};

export const groupProjectsByCategory = (projects) => {
    if (!Array.isArray(projects) || projects.length === 0) return {};
    return projects.reduce((groups, project) => {
        const category = project.category || 'Uncategorized';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(project);
        return groups;
    }, {});
};

export const isSameDay = (d1, d2) => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export const getGroupLabel = (date) => {
    const today = new Date();
    if (isSameDay(date, today)) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(date, yesterday)) return 'Yesterday';
    return date.toLocaleDateString();
};

export const groupMessagesByDate = (messagesArr) => {
    const groups = {};
    messagesArr.forEach((msg) => {
        const d = new Date(msg.createdAt);
        const label = getGroupLabel(d);
        if (!groups[label]) {
            groups[label] = [];
        }
        groups[label].push(msg);
    });
    return groups;
};
