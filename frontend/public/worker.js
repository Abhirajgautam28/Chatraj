// Web Worker to handle heavy data processing off the main thread
self.onmessage = function(e) {
  const { type, data } = e.data;

  if (type === 'NORMALIZE_FILE_TREE') {
    const tree = data;
    if (!tree || typeof tree !== 'object') {
      self.postMessage({ type: 'NORMALIZE_FILE_TREE_RESULT', data: {} });
      return;
    }

    const normalized = {};
    for (const [key, value] of Object.entries(tree)) {
      if (value && typeof value === 'object' && 'file' in value && typeof value.file.contents === 'string') {
        normalized[key] = value;
      } else if (typeof value === 'string') {
        normalized[key] = { file: { contents: value } };
      }
    }
    self.postMessage({ type: 'NORMALIZE_FILE_TREE_RESULT', data: normalized });
  }

  if (type === 'DEDUPLICATE_MESSAGES') {
    const messages = data;
    const seen = new Set();
    const result = messages.filter(msg => {
      if (!msg._id) return true;
      if (seen.has(msg._id)) return false;
      seen.add(msg._id);
      return true;
    });
    self.postMessage({ type: 'DEDUPLICATE_MESSAGES_RESULT', data: result });
  }
};
