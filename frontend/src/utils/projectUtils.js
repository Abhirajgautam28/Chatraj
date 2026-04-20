/**
 * Utility to group messages by date for display in the chat UI.
 */
export const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach(msg => {
    const date = new Date(msg.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
  });
  return groups;
};

/**
 * Normalizes file tree structure from backend to ensure consistent format.
 */
export const normalizeFileTree = (tree) => {
  if (!tree || typeof tree !== 'object') return {};
  const normalized = {};
  for (const [key, value] of Object.entries(tree)) {
    if (value && typeof value === 'object' && 'file' in value) {
      normalized[key] = value;
    } else if (typeof value === 'string') {
      normalized[key] = { file: { contents: value } };
    }
  }
  return normalized;
};
