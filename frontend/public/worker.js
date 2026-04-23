// Heavy Data processing Web Worker
self.onmessage = (e) => {
    const { action, data } = e.data;

    if (action === 'normalize_file_tree') {
        const normalized = normalize(data);
        self.postMessage({ action: 'normalize_file_tree_result', result: normalized });
    }

    if (action === 'search_messages') {
        const { messages, query } = data;
        const lowerSearch = query.toLowerCase();
        const filtered = messages.filter(msg =>
            msg.message && msg.message.toLowerCase().includes(lowerSearch)
        );
        self.postMessage({ action: 'search_messages_result', result: filtered });
    }
};

function normalize(tree) {
    if (!tree) return {};
    const result = {};
    Object.keys(tree).forEach(path => {
        result[path] = { ...tree[path], open: false };
    });
    return result;
}
