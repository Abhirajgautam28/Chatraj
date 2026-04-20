/**
 * Utility for parsing and cleaning AI-generated responses.
 */

/**
 * Attempts to parse a JSON response from the AI.
 * If the response is wrapped in Markdown code blocks, it extracts and parses the JSON inside.
 *
 * @param {string} rawText - The raw response text from the AI.
 * @returns {Object|null} The parsed JSON object or null if parsing fails.
 */
export function parseAIJsonResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const cleaned = rawText.trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract from markdown JSON block
    const match = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}
