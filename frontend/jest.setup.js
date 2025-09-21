// Polyfill window.matchMedia for jsdom test environment
// Add custom matchers from @testing-library/jest-dom for Vitest
import '@testing-library/jest-dom';
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () { return false; }
    };
  };
}

// Polyfill window.IntersectionObserver for jsdom test environment (for framer-motion)
if (typeof window !== 'undefined' && typeof window.IntersectionObserver === 'undefined') {
  window.IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}
// Mock VimCodeEditor to prevent Monaco and CSS import errors in tests
vi.mock('../src/components/VimCodeEditor.jsx', () => ({
  default: () => {
    return globalThis.React ? globalThis.React.createElement('div', { 'data-testid': 'vim-code-editor-mock' }, 'VimCodeEditor Mock') : null;
  },
}), { virtual: true });
// Mock all CSS imports to an empty object for Vitest
vi.mock('*.css', () => ({}), { virtual: true });
// Always mock @monaco-editor/react for Vitest
import React from 'react';
import { vi } from 'vitest';
vi.mock('@monaco-editor/react', () => ({
  default: () => React.createElement('div', { 'data-testid': 'monaco-editor-mock' }, 'Monaco Editor Mock'),
}));
// Polyfill import.meta.env for Vitest (Vite env variables in tests)
if (typeof import.meta === 'undefined') {
  globalThis.import = { meta: { env: { VITE_RECAPTCHA_SITE_KEY: 'test-key' } } };
} else if (!import.meta.env) {
  import.meta.env = { VITE_RECAPTCHA_SITE_KEY: 'test-key' };
}
import { TextEncoder, TextDecoder } from 'util';
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}
