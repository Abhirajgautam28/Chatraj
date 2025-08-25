// Mock for VimCodeEditor to avoid Monaco and CSS import errors in tests
import React from 'react';
const VimCodeEditor = () => <div data-testid="vim-code-editor-mock">VimCodeEditor Mock</div>;
export default VimCodeEditor;