/**
 * Centralized utility for parsing AI responses.
 * Handles both stringified JSON and plain text responses from Google AI.
 */
export const parseAiResponse = (result) => {
    if (!result) return '';

    let responseText;
    try {
        const parsed = typeof result === 'string' ? JSON.parse(result) : result;
        // If parsed has a 'text' property, use it; else, use the whole parsed object as string
        responseText = parsed.text || (typeof parsed === 'object' ? JSON.stringify(parsed) : String(parsed));
    } catch (e) {
        // Not JSON or parsing failed, treat as plain text
        responseText = typeof result === 'string' ? result : JSON.stringify(result);
    }
    return responseText;
};
