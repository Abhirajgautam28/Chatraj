// Mock for @monaco-editor/react to prevent errors in Vitest
import React from 'react';
// Return a dummy component
const MonacoEditor = () => <div data-testid="monaco-editor-mock">Monaco Editor Mock</div>;
export default MonacoEditor;