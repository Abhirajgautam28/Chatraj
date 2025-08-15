import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MonacoEditor from '@monaco-editor/react';
import { initVimMode } from 'monaco-vim';
import ReactModal from 'react-modal';

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
      { label: 'Folding', key: 'folding', type: 'toggle' },
      { label: 'Render Whitespace', key: 'renderWhitespace', type: 'toggle' },
      { label: 'Bracket Pair Colorization', key: 'bracketPairColorization', type: 'toggle' },
      { label: 'Indentation Guides', key: 'guides', type: 'toggle' },
      { label: 'Inlay Hints', key: 'inlayHints', type: 'toggle' },
      { label: 'Hover', key: 'hover', type: 'toggle' },
      { label: 'Context Menu', key: 'contextmenu', type: 'toggle' },
      { label: 'Theme', key: 'theme', type: 'select', options: THEMES },
      { label: 'Font Size', key: 'fontSize', type: 'select', options: [
        { label: '14px', value: 14 },
        { label: '16px', value: 16 },
        { label: '18px', value: 18 },
        { label: '20px', value: 20 },
      ] },
    ],
  },
  {
    name: 'Editor',
    options: [
      { label: 'Format On Type', key: 'formatOnType', type: 'toggle' },
      { label: 'Format On Paste', key: 'formatOnPaste', type: 'toggle' },
      { label: 'Auto Closing Brackets', key: 'autoClosingBrackets', type: 'toggle' },
      { label: 'Auto Closing Quotes', key: 'autoClosingQuotes', type: 'toggle' },
      { label: 'Match Brackets', key: 'matchBrackets', type: 'toggle' },
      { label: 'Cursor Blinking', key: 'cursorBlinking', type: 'select', options: [
        { label: 'Blink', value: 'blink' },
        { label: 'Smooth', value: 'smooth' },
        { label: 'Phase', value: 'phase' },
        { label: 'Expand', value: 'expand' },
        { label: 'Solid', value: 'solid' },
      ] },
      { label: 'Tab Size', key: 'tabSize', type: 'select', options: [
        { label: '2', value: 2 },
        { label: '4', value: 4 },
        { label: '8', value: 8 },
      ] },
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
  const [, setFileName] = useState('untitled.txt');
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
      // Handle toggles for all supported Monaco options
      switch (optionKey) {
        case 'lineNumbers':
          newOpts.lineNumbers = opts.lineNumbers === 'on' ? 'off' : 'on';
          break;
        case 'minimap':
          newOpts.minimap = { ...opts.minimap, enabled: !opts.minimap.enabled };
          break;
        case 'wordWrap':
          newOpts.wordWrap = opts.wordWrap === 'on' ? 'off' : 'on';
          break;
        case 'folding':
          newOpts.folding = !opts.folding;
          break;
        case 'renderWhitespace':
          newOpts.renderWhitespace = opts.renderWhitespace === 'all' ? 'none' : 'all';
          break;
        case 'bracketPairColorization':
          newOpts.bracketPairColorization = { enabled: !opts.bracketPairColorization.enabled };
          break;
        case 'guides':
          newOpts.guides = { indentation: !opts.guides.indentation };
          break;
        case 'inlayHints':
          newOpts.inlayHints = { enabled: !opts.inlayHints.enabled };
          break;
        case 'hover':
          newOpts.hover = { enabled: !opts.hover.enabled };
          break;
        case 'contextmenu':
          newOpts.contextmenu = !opts.contextmenu;
          break;
        case 'formatOnType':
          newOpts.formatOnType = !opts.formatOnType;
          break;
        case 'formatOnPaste':
          newOpts.formatOnPaste = !opts.formatOnPaste;
          break;
        case 'autoClosingBrackets':
          newOpts.autoClosingBrackets = opts.autoClosingBrackets === 'always' ? 'never' : 'always';
          break;
        case 'autoClosingQuotes':
          newOpts.autoClosingQuotes = opts.autoClosingQuotes === 'always' ? 'never' : 'always';
          break;
        case 'matchBrackets':
          newOpts.matchBrackets = opts.matchBrackets === 'always' ? 'never' : 'always';
          break;
        default:
          break;
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
      <Dialog open={showOptionsModal} onClose={onCloseOptionsModal} fullWidth maxWidth="md">
        <DialogTitle>
          Options
          <IconButton
            aria-label="close"
            onClick={onCloseOptionsModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs
            value={selectedCategory}
            onChange={(e, newValue) => setSelectedCategory(newValue)}
            aria-label="options tabs"
          >
            {FEATURE_CATEGORIES.map((cat) => (
              <Tab key={cat.name} label={cat.name} value={cat.name} />
            ))}
          </Tabs>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
                {FEATURE_CATEGORIES.find(cat => cat.name === selectedCategory).options.map(opt => (
                    <Grid item xs={12} sm={6} key={opt.key}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography>{opt.label}</Typography>
                            {opt.type === 'toggle' && (
                                <Switch
                                    checked={(() => {
                                        switch (opt.key) {
                                            case 'lineNumbers': return editorOptions.lineNumbers === 'on';
                                            case 'minimap': return editorOptions.minimap.enabled;
                                            case 'wordWrap': return editorOptions.wordWrap === 'on';
                                            case 'folding': return editorOptions.folding;
                                            case 'renderWhitespace': return editorOptions.renderWhitespace === 'all';
                                            case 'bracketPairColorization': return editorOptions.bracketPairColorization.enabled;
                                            case 'guides': return editorOptions.guides.indentation;
                                            case 'inlayHints': return editorOptions.inlayHints.enabled;
                                            case 'hover': return editorOptions.hover.enabled;
                                            case 'contextmenu': return editorOptions.contextmenu;
                                            case 'formatOnType': return editorOptions.formatOnType;
                                            case 'formatOnPaste': return editorOptions.formatOnPaste;
                                            case 'autoClosingBrackets': return editorOptions.autoClosingBrackets === 'always';
                                            case 'autoClosingQuotes': return editorOptions.autoClosingQuotes === 'always';
                                            case 'matchBrackets': return editorOptions.matchBrackets === 'always';
                                            default: return false;
                                        }
                                    })()}
                                    onChange={() => handleToggleOption(opt.key)}
                                />
                            )}
                            {opt.type === 'select' && (
                                <Select
                                    value={(() => {
                                        if (opt.key === 'theme') return theme;
                                        if (opt.key === 'fontSize') return editorOptions.fontSize;
                                        if (opt.key === 'cursorBlinking') return editorOptions.cursorBlinking;
                                        if (opt.key === 'tabSize') return editorOptions.tabSize;
                                        return '';
                                    })()}
                                    onChange={(e) => {
                                        if (opt.key === 'theme') handleThemeChange(e.target.value);
                                        else setEditorOptions(opts => ({ ...opts, [opt.key]: e.target.value }));
                                    }}
                                >
                                    {opt.options.map(t => (
                                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                    ))}
                                </Select>
                            )}
                            {opt.type === 'action' && (
                                <Button onClick={() => runEditorAction(opt.key)}>{opt.label}</Button>
                            )}
                        </Box>
                    </Grid>
                ))}
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
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
