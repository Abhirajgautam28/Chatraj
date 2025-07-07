import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MonacoEditor from '@monaco-editor/react';
import { initVimMode, disposeVimMode } from 'monaco-vim';

const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'ruby', 'php', 'json', 'markdown', 'html', 'css', 'scss', 'less', 'shell', 'powershell', 'sql', 'yaml', 'xml', 'plaintext'
];

// Additional themes
const THEMES = [
  { label: 'VS Dark', value: 'vs-dark' },
  { label: 'VS Light', value: 'vs-light' },
  { label: 'HC Black', value: 'hc-black' },
  { label: 'HC Light', value: 'hc-light' },
];

const DEFAULT_OPTIONS = {
  fontSize: 16,
  minimap: { enabled: true },
  contextmenu: true,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  wordWrap: 'on',
  cursorBlinking: 'blink',
  renderLineHighlight: 'all',
  tabSize: 2,
  formatOnType: true,
  formatOnPaste: true,
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  codeLens: true,
  folding: true,
  links: true,
  renderWhitespace: 'all',
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  matchBrackets: 'always',
  find: { seedSearchStringFromSelection: true },
  bracketPairColorization: { enabled: true },
  guides: { indentation: true },
  inlayHints: { enabled: true },
  hover: { enabled: true },
};

const VimCodeEditor = ({
  value,
  onChange,
  isDarkMode,
  fontSize = '16px',
  language = 'javascript',
  ...rest
}) => {
  const editorRef = useRef(null);
  const vimModeRef = useRef(null);
  const [status, setStatus] = useState({
    line: 1,
    col: 1,
    language: language,
    vim: false,
    vimStatus: '',
  });
  const [vimMode, setVimMode] = useState(false);
  const [theme, setTheme] = useState(isDarkMode ? 'vs-dark' : 'vs-light');
  const [editorOptions, setEditorOptions] = useState(DEFAULT_OPTIONS);
  const [showSnippetMenu, setShowSnippetMenu] = useState(false);
  const [showVimRemapMenu, setShowVimRemapMenu] = useState(false);
  const [vimRemaps, setVimRemaps] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [fileName, setFileName] = useState('untitled.txt');

  // Update status bar on cursor move
  function handleEditorChange(value, event) {
    if (onChange) onChange(value, event);
  }

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition(() => {
      const position = editor.getPosition();
      setStatus((s) => ({ ...s, line: position.lineNumber, col: position.column }));
    });
    // Enable Vim mode if toggled
    if (vimMode) {
      if (vimModeRef.current) vimModeRef.current.dispose();
      vimModeRef.current = initVimMode(editor, document.getElementById('vim-status-bar'));
      vimModeRef.current.onDidChangeStatus((vimStatus) => {
        setStatus((s) => ({ ...s, vimStatus }));
      });
    }
  }

  // Toggle Vim mode and language menu
  useEffect(() => {
    function handleKeyDown(e) {
      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        if (editorRef.current) {
          editorRef.current.trigger('keyboard', 'editor.action.quickCommand', null);
        }
      }
      // Toggle Vim mode with Ctrl+Alt+V
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'v') {
        setVimMode((v) => !v);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Re-initialize Vim mode when toggled
  useEffect(() => {
    if (editorRef.current) {
      if (vimMode) {
        if (vimModeRef.current) vimModeRef.current.dispose();
        vimModeRef.current = initVimMode(editorRef.current, document.getElementById('vim-status-bar'));
        vimModeRef.current.onDidChangeStatus((vimStatus) => {
          setStatus((s) => ({ ...s, vimStatus }));
        });
      } else if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
      setStatus((s) => ({ ...s, vim: vimMode }));
    }
  }, [vimMode]);

  // Custom actions: format, go to definition, find references, etc.
  function runEditorAction(action) {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', action, null);
    }
  }

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
  }

  function handleToggleOption(optionKey) {
    setEditorOptions((opts) => {
      const newOpts = { ...opts };
      if (typeof opts[optionKey] === 'object') {
        newOpts[optionKey].enabled = !opts[optionKey].enabled;
      } else if (typeof opts[optionKey] === 'boolean') {
        newOpts[optionKey] = !opts[optionKey];
      } else if (optionKey === 'lineNumbers') {
        newOpts.lineNumbers = opts.lineNumbers === 'on' ? 'off' : 'on';
      } else if (optionKey === 'wordWrap') {
        newOpts.wordWrap = opts.wordWrap === 'on' ? 'off' : 'on';
      }
      return newOpts;
    });
  }

  function handleInsertSnippet(snippet) {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'type', { text: snippet });
      setShowSnippetMenu(false);
    }
  }

  function handleAddVimRemap(from, to) {
    setVimRemaps((remaps) => [...remaps, { from, to }]);
    setShowVimRemapMenu(false);
    // Optionally, apply remap to monaco-vim here
  }

  function handleDownload() {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (onChange) onChange(evt.target.result);
      setFileName(file.name);
    };
    reader.readAsText(file);
  }

  // Diagnostics (errors/warnings)
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        import('monaco-editor').then(monaco => {
          setDiagnostics(monaco.editor.getModelMarkers({ resource: model.uri }));
        });
      }
    }
  }, [value, language]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MonacoEditor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={editorOptions}
        {...rest}
      />
      {/* Theme Switcher */}
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10002 }}>
        <select value={theme} onChange={e => handleThemeChange(e.target.value)} title="Switch Theme">
          {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      {/* Snippet Menu */}
      {showSnippetMenu && (
        <div style={{ position: 'absolute', top: 40, left: 40, zIndex: 10001, background: isDarkMode ? '#23272e' : '#fff', color: isDarkMode ? '#fff' : '#222', border: '1px solid #444', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.25)', minWidth: 200, maxHeight: 400, overflowY: 'auto' }}>
          <div style={{ padding: 12, fontWeight: 600 }}>Insert Snippet</div>
          <button style={{ padding: '8px 16px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => handleInsertSnippet('console.log($1);')}>console.log()</button>
          <button style={{ padding: '8px 16px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => handleInsertSnippet('function $1() {\n  $2\n}')}>function</button>
          <button style={{ padding: '8px 16px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => handleInsertSnippet('if ($1) {\n  $2\n}')}>if statement</button>
          {/* Add more snippets as needed */}
        </div>
      )}
      {/* Vim Remap Menu */}
      {showVimRemapMenu && (
        <div style={{ position: 'absolute', top: 80, left: 40, zIndex: 10001, background: isDarkMode ? '#23272e' : '#fff', color: isDarkMode ? '#fff' : '#222', border: '1px solid #444', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.25)', minWidth: 300, maxHeight: 400, overflowY: 'auto', padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Add Vim Key Remap</div>
          <form onSubmit={e => { e.preventDefault(); handleAddVimRemap(e.target.from.value, e.target.to.value); }}>
            <input name="from" placeholder="From (e.g. jj)" style={{ marginRight: 8 }} />
            <input name="to" placeholder="To (e.g. <Esc>)" style={{ marginRight: 8 }} />
            <button type="submit">Add</button>
          </form>
          <div style={{ marginTop: 12 }}>
            {vimRemaps.map((r) => <div key={r.from + '->' + r.to}>{r.from} → {r.to}</div>)}
          </div>
        </div>
      )}
      {/* File Upload (hidden input) */}
      <input type="file" style={{ display: 'none' }} id="vim-upload-input" onChange={handleUpload} />
      {/* Status Bar */}
      <div id="vim-status-bar" style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '28px',
        background: isDarkMode ? '#23272e' : '#f3f3f3',
        color: isDarkMode ? '#fff' : '#222',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderTop: isDarkMode ? '1px solid #333' : '1px solid #ddd',
        zIndex: 2,
        userSelect: 'none',
      }}>
        <span style={{ marginRight: 16 }}>Ln {status.line}, Col {status.col}</span>
        <span style={{ marginRight: 16 }}>{status.language}</span>
        <span style={{ marginRight: 16 }}>
          {status.vim && status.vimStatus
            ? `Vim Mode • ${status.vimStatus} (Ctrl+Alt+V)`
            : status.vim
              ? 'Vim Mode (Ctrl+Alt+V)'
              : 'Insert Mode (Ctrl+Alt+V to toggle Vim)'}
        </span>
        <button style={{ marginRight: 16 }} onClick={() => setShowSnippetMenu(v => !v)} title="Insert Snippet">Snippet</button>
        <button style={{ marginRight: 16 }} onClick={() => setShowVimRemapMenu(v => !v)} title="Vim Remap">Vim Remap</button>
        <button style={{ marginRight: 16 }} onClick={handleDownload} title="Download File">Download</button>
        <button style={{ marginRight: 16 }} onClick={() => document.getElementById('vim-upload-input').click()} title="Upload File">Upload</button>
        <button style={{ marginRight: 16 }} onClick={() => runEditorAction('editor.action.startFindReplaceAction')} title="Find/Replace (Ctrl+H)">Find/Replace</button>
        <button style={{ marginRight: 16 }} onClick={() => runEditorAction('editor.action.insertCursorBelow')} title="Add Cursor Below (Ctrl+Alt+Down)">+Cursor</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('minimap')} title="Toggle Minimap">Minimap</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('lineNumbers')} title="Toggle Line Numbers">Line #</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('wordWrap')} title="Toggle Word Wrap">Wrap</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('codeLens')} title="Toggle Code Lens">CodeLens</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('folding')} title="Toggle Folding">Folding</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('renderWhitespace')} title="Toggle Whitespace">Whitespace</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('bracketPairColorization')} title="Toggle Bracket Colors">Brackets</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('guides')} title="Toggle Indent Guides">Guides</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('inlayHints')} title="Toggle Inlay Hints">Inlay</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('hover')} title="Toggle Hover">Hover</button>
        <button style={{ marginRight: 16 }} onClick={() => handleToggleOption('contextmenu')} title="Toggle Context Menu">Context</button>
        <span style={{ marginRight: 16, color: diagnostics.length ? 'red' : 'inherit' }} title="Problems">Problems: {diagnostics.length}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.7 }}>Monaco Editor • Ctrl+Shift+P</span>
      </div>
    </div>
  );
};

VimCodeEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool,
  fontSize: PropTypes.string,
  language: PropTypes.string,
};

export default VimCodeEditor;
