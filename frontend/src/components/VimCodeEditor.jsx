import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MonacoEditor from '@monaco-editor/react';
import { initVimMode, disposeVimMode } from 'monaco-vim';
import ReactModal from 'react-modal';

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
  smoothScrolling: true,
  wordWrap: 'on',
  cursorBlinking: 'blink',
  renderLineHighlight: 'all',
  tabSize: 2,
  formatOnType: true,
  formatOnPaste: true,
  suggestOnTriggerCharacters: true,
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

const FEATURE_CATEGORIES = [
  {
    name: 'View',
    options: [
      { label: 'Line Numbers', key: 'lineNumbers', type: 'toggle' },
      { label: 'Minimap', key: 'minimap', type: 'toggle' },
      { label: 'Word Wrap', key: 'wordWrap', type: 'toggle' },
      { label: 'CodeLens', key: 'codeLens', type: 'toggle' },
      { label: 'Folding', key: 'folding', type: 'toggle' },
      { label: 'Whitespace', key: 'renderWhitespace', type: 'toggle' },
      { label: 'Brackets', key: 'bracketPairColorization', type: 'toggle' },
      { label: 'Guides', key: 'guides', type: 'toggle' },
      { label: 'Inlay Hints', key: 'inlayHints', type: 'toggle' },
      { label: 'Hover', key: 'hover', type: 'toggle' },
      { label: 'Context Menu', key: 'contextmenu', type: 'toggle' },
      { label: 'Theme', key: 'theme', type: 'select', options: THEMES },
    ],
  },
  {
    name: 'Problems',
    options: [
      { label: 'Show Problems', key: 'problems', type: 'problems' },
    ],
  },
  {
    name: 'File',
    options: [
      { label: 'Download', key: 'download', type: 'action' },
      { label: 'Upload', key: 'upload', type: 'upload' },
    ],
  },
];

const VimCodeEditor = ({
  value,
  onChange,
  isDarkMode,
  fontSize = '16px',
  language = 'javascript',
  showOptionsModal = false, // controlled by parent
  onCloseOptionsModal = () => {}, // controlled by parent
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
  const [selectedCategory, setSelectedCategory] = useState(FEATURE_CATEGORIES[0].name);

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
      // Remove broken onDidChangeStatus usage
      // Instead, update Vim status by reading the status bar element's textContent
      setTimeout(() => {
        const bar = document.getElementById('vim-status-bar');
        if (bar) setStatus((s) => ({ ...s, vimStatus: bar.textContent }));
      }, 100);
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
        // Remove broken onDidChangeStatus usage
        setTimeout(() => {
          const bar = document.getElementById('vim-status-bar');
          if (bar) setStatus((s) => ({ ...s, vimStatus: bar.textContent }));
        }, 100);
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
      {/* Options Modal - now styled to match Settings modal */}
      <ReactModal
        isOpen={showOptionsModal}
        onRequestClose={onCloseOptionsModal}
        closeTimeoutMS={250}
        ariaHideApp={false}
        className="fixed z-50 w-full max-w-md bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 rounded-xl dark:border-gray-700 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none flex flex-col"
        overlayClassName="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center"
      >
        {/* Modal Header - sticky, matches settings modal */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b cursor-move select-none dark:bg-gray-800 dark:border-gray-700 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Options</h2>
          <button
            onClick={onCloseOptionsModal}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Close options modal"
          >
            <i className="text-2xl ri-close-line"></i>
          </button>
        </div>
        {/* Category Tabs - matches settings modal */}
        <div className="flex px-6 bg-gray-100 border-b dark:border-gray-700 dark:bg-gray-700">
          {FEATURE_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 text-base font-semibold border-b-4 transition-colors duration-150 focus:outline-none ${selectedCategory === cat.name ? 'border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-400' : 'border-transparent text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 bg-transparent'}`}
              style={{ marginBottom: '-1px', borderRadius: '10px 10px 0 0' }}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {/* Options Content - now in a two-column grid, no vertical scroll needed */}
        <div className="flex-1" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {FEATURE_CATEGORIES.find(cat => cat.name === selectedCategory).options.map(opt => {
              // Determine toggle state correctly for all types
              let isToggled = false;
              if (typeof editorOptions[opt.key] === 'object' && editorOptions[opt.key] !== null && 'enabled' in editorOptions[opt.key]) {
                isToggled = !!editorOptions[opt.key].enabled;
              } else if (typeof editorOptions[opt.key] === 'boolean') {
                isToggled = editorOptions[opt.key];
              } else if (opt.key === 'lineNumbers') {
                isToggled = editorOptions.lineNumbers === 'on';
              } else if (opt.key === 'wordWrap') {
                isToggled = editorOptions.wordWrap === 'on';
              }
              return (
                <div key={opt.key} className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-gray-900 dark:text-white">{opt.label}</span>
                  {opt.type === 'toggle' && (
                    <button
                      onClick={() => handleToggleOption(opt.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${isToggled ? 'bg-blue-600' : 'bg-gray-300'}`}
                      aria-pressed={isToggled}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isToggled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  )}
                  {opt.type === 'select' && (
                    <select
                      value={theme}
                      onChange={e => handleThemeChange(e.target.value)}
                      className="p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      {opt.options.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  )}
                  {opt.type === 'action' && (
                    <button
                      onClick={() => runEditorAction(opt.key)}
                      className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 font-semibold shadow"
                    >
                      {opt.label}
                    </button>
                  )}
                  {/* ...existing code for other option types... */}
                </div>
              );
            })}
          </div>
        </div>
      </ReactModal>
      {/* Monaco Editor */}
      <MonacoEditor
        height="calc(100% - 68px)"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={editorOptions}
        {...rest}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 28 }}
      />
      {/* Snippet Menu */}
      {showSnippetMenu && (
        <div style={{ position: 'absolute', top: 48, left: 40, zIndex: 10001, background: isDarkMode ? '#23272e' : '#fff', color: isDarkMode ? '#fff' : '#222', border: '1px solid #444', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.25)', minWidth: 200, maxHeight: 400, overflowY: 'auto' }}>
          <div style={{ padding: 12, fontWeight: 600 }}>Insert Snippet</div>
          <button style={{ padding: '8px 16px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => handleInsertSnippet('console.log($1);')}>console.log()</button>
          <button style={{ padding: '8px 16px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => handleInsertSnippet('function $1() {\n  $2\n}')}>function</button>
          <button style={{ padding: '8px 16px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => handleInsertSnippet('if ($1) {\n  $2\n}')}>if statement</button>
          {/* Add more snippets as needed */}
        </div>
      )}
      {/* Vim Remap Menu */}
      {showVimRemapMenu && (
        <div style={{ position: 'absolute', top: 88, left: 40, zIndex: 10001, background: isDarkMode ? '#23272e' : '#fff', color: isDarkMode ? '#fff' : '#222', border: '1px solid #444', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.25)', minWidth: 300, maxHeight: 400, overflowY: 'auto', padding: 16 }}>
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
      {/* Status Bar (Bottom) */}
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
  showOptionsModal: PropTypes.bool,
  onCloseOptionsModal: PropTypes.func,
};

export default VimCodeEditor;
