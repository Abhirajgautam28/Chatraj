import { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vim } from '@replit/codemirror-vim';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView, keymap, highlightActiveLine, highlightActiveLineGutter, lineNumbers, rectangularSelection, drawSelection, highlightSpecialChars } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches, search } from '@codemirror/search';
import { foldGutter, foldKeymap, bracketMatching } from '@codemirror/language';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { closeBrackets } from '@codemirror/autocomplete';

// VS Code-like Command Palette
const COMMANDS = [
  { label: 'Cut', action: () => document.execCommand('cut') },
  { label: 'Copy', action: () => document.execCommand('copy') },
  { label: 'Paste', action: () => document.execCommand('paste') },
  { label: 'Undo', action: () => document.execCommand('undo') },
  { label: 'Redo', action: () => document.execCommand('redo') },
  { label: 'Select All', action: () => document.execCommand('selectAll') },
  { label: 'Find', action: (view) => view && view.dispatch({ effects: search.openSearchPanel.of(true) }) },
  { label: 'Toggle Line Numbers', action: null },
  { label: 'Toggle Vim Mode', action: null },
];

const VimCodeEditor = ({
  value,
  onChange,
  isDarkMode,
  fontSize = '1rem',
  language = 'javascript',
  ...rest
}) => {
  const editorRef = useRef(null);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [status, setStatus] = useState({
    mode: 'NORMAL',
    line: 1,
    col: 1,
    language: language,
  });

  // Update status bar on cursor move
  const handleUpdate = useCallback((viewUpdate) => {
    if (viewUpdate.state && viewUpdate.state.selection) {
      const { main } = viewUpdate.state.selection;
      // Guard: CodeMirror lines are 1-based, main.head can be 0
      let line = 1;
      let col = 1;
      if (main.head >= 0 && main.head < viewUpdate.state.doc.length) {
        const lineObj = viewUpdate.state.doc.lineAt(main.head);
        line = lineObj.number;
        col = main.head - lineObj.from + 1;
      }
      setStatus((s) => {
        if (s.line !== line || s.col !== col) {
          return { ...s, line, col };
        }
        return s;
      });
    }
  }, []);

  // Command palette logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowPalette((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Custom context menu for VS Code-like feel
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    menu.style.background = isDarkMode ? '#23272e' : '#fff';
    menu.style.color = isDarkMode ? '#fff' : '#222';
    menu.style.border = '1px solid #444';
    menu.style.borderRadius = '6px';
    menu.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
    menu.style.zIndex = 9999;
    menu.style.fontSize = '14px';
    menu.style.minWidth = '180px';
    menu.style.padding = '4px 0';
    const actions = [
      { label: 'Cut', action: () => document.execCommand('cut') },
      { label: 'Copy', action: () => document.execCommand('copy') },
      { label: 'Paste', action: () => document.execCommand('paste') },
      { label: 'Undo', action: () => document.execCommand('undo') },
      { label: 'Redo', action: () => document.execCommand('redo') },
      { label: 'Select All', action: () => document.execCommand('selectAll') },
      { label: 'Find', action: () => editorRef.current && editorRef.current.view && editorRef.current.view.dispatch({ effects: search.openSearchPanel.of(true) }) },
    ];
    actions.forEach(({ label, action }) => {
      const item = document.createElement('div');
      item.textContent = label;
      item.style.padding = '6px 18px';
      item.style.cursor = 'pointer';
      item.onmouseenter = () => (item.style.background = isDarkMode ? '#333' : '#f0f0f0');
      item.onmouseleave = () => (item.style.background = '');
      item.onclick = () => {
        action();
        document.body.removeChild(menu);
      };
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    const removeMenu = () => {
      if (menu.parentNode) menu.parentNode.removeChild(menu);
      window.removeEventListener('click', removeMenu);
    };
    setTimeout(() => window.addEventListener('click', removeMenu), 0);
  }, [isDarkMode]);

  // Status bar mode update (Vim)
  useEffect(() => {
    if (!editorRef.current || !editorRef.current.view) return;
    const cm = editorRef.current.view;
    // Listen for Vim mode changes
    const handler = (event) => {
      if (event && event.mode) {
        setStatus((s) => ({ ...s, mode: event.mode.toUpperCase() }));
      }
    };
    window.CodeMirror && window.CodeMirror.on && window.CodeMirror.on(cm, 'vim-mode-change', handler);
    return () => {
      window.CodeMirror && window.CodeMirror.off && window.CodeMirror.off(cm, 'vim-mode-change', handler);
    };
  }, []);

  // Command palette filtered commands
  const filteredCommands = COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  // Editor extensions
  const extensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    drawSelection(),
    EditorView.lineWrapping,
    highlightActiveLine(),
    rectangularSelection(),
    history(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    foldGutter(),
    highlightSelectionMatches(),
    autocompletion(),
    bracketMatching(),
    closeBrackets(),
    vim(),
    javascript(),
    EditorView.updateListener.of(handleUpdate),
  ];

  return (
    <div onContextMenu={handleContextMenu} style={{ height: '100%', width: '100%', position: 'relative' }}>
      <CodeMirror
        ref={editorRef}
        value={value}
        height="100%"
        theme={vscodeDark}
        extensions={extensions}
        onChange={onChange}
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize,
          background: isDarkMode ? '#1e1e1e' : '#fff',
          color: isDarkMode ? '#d4d4d4' : '#222',
          minHeight: 0,
        }}
        {...rest}
      />
      {/* Status Bar */}
      <div style={{
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
        <span style={{ marginRight: 16 }}><b>{status.mode}</b></span>
        <span style={{ marginRight: 16 }}>Ln {status.line}, Col {status.col}</span>
        <span style={{ marginRight: 16 }}>{status.language}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.7 }}>Vim Mode • Ctrl+Shift+P</span>
      </div>
      {/* Command Palette */}
      {showPalette && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          background: isDarkMode ? '#23272e' : '#fff',
          color: isDarkMode ? '#fff' : '#222',
          border: '1px solid #444',
          borderRadius: '8px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
          zIndex: 10000,
          minWidth: 340,
          maxWidth: 480,
        }}>
          <input
            autoFocus
            value={paletteQuery}
            onChange={e => setPaletteQuery(e.target.value)}
            placeholder="Type a command..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              outline: 'none',
              background: 'inherit',
              color: 'inherit',
              fontSize: 16,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') setShowPalette(false);
            }}
          />
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {filteredCommands.length === 0 && (
              <div style={{ padding: 16, opacity: 0.6 }}>No commands found</div>
            )}
            {filteredCommands.map((cmd, i) => (
              <div
                key={cmd.label}
                style={{ padding: '10px 18px', cursor: 'pointer', borderBottom: '1px solid #333', background: i === 0 ? (isDarkMode ? '#333' : '#f0f0f0') : 'inherit' }}
                onClick={() => {
                  setShowPalette(false);
                  if (cmd.action) { cmd.action(editorRef.current?.view); }
                }}
              >
                {cmd.label}
              </div>
            ))}
          </div>
        </div>
      )}
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
