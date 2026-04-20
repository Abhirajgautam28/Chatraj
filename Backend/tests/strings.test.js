import { escapeRegex, escapeHtml, maskKey } from '../utils/strings.js';

describe('Strings Utility', () => {
  test('escapeRegex should escape special characters', () => {
    expect(escapeRegex('.*+?^$')).toBe('\\.\\*\\+\\?\\^\\$');
  });

  test('escapeHtml should escape unsafe characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  test('maskKey should mask keys correctly', () => {
    expect(maskKey('1234567890')).toBe('**********');
    expect(maskKey('123456789012')).toBe('1234****9012');
  });
});
