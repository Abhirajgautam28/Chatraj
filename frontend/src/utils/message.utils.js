export const deduplicateMessages = (messages) => {
  const seen = new Set();
  return messages.filter(msg => {
    if (!msg._id) return true;
    if (seen.has(msg._id)) return false;
    seen.add(msg._id);
    return true;
  });
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
