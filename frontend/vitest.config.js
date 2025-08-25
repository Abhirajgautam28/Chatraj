import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
  'monaco-editor': path.resolve(__dirname, './__mocks__/monaco-editor.js'),
  '@monaco-editor/react': path.resolve(__dirname, './__mocks__/monaco-editor-react.js'),
  // Alias VimCodeEditor to a mock to avoid Monaco and CSS in tests
  '../src/components/VimCodeEditor.jsx': path.resolve(__dirname, './__mocks__/VimCodeEditor.jsx'),
  './src/components/VimCodeEditor.jsx': path.resolve(__dirname, './__mocks__/VimCodeEditor.jsx'),
  'src/components/VimCodeEditor.jsx': path.resolve(__dirname, './__mocks__/VimCodeEditor.jsx'),
  '@/components/VimCodeEditor.jsx': path.resolve(__dirname, './__mocks__/VimCodeEditor.jsx'),
      // Alias all .css imports to a style mock
    },
  },
  test: {
    environment: 'jsdom',
  setupFiles: ['./register-css-mock.js', './jest.setup.js'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
