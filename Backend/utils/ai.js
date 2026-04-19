/**
 * Parses the result from the AI service.
 * @param {string|object} result - The result from the AI service.
 * @returns {string} - The parsed text response.
 */
export const parseAiResponse = (result) => {
    let responseText;
    try {
        const parsed = typeof result === 'string' ? JSON.parse(result) : result;
        // If parsed has a 'text' property, use it; else, use the whole parsed object as string
        responseText = (parsed && parsed.text) || JSON.stringify(parsed);
    } catch (e) {
        responseText = typeof result === 'string' ? result : JSON.stringify(result);
    }
    return responseText;
};

export default {
    parseAiResponse
};
