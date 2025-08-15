import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MonacoEditor from '@monaco-editor/react';
import { initVimMode } from 'monaco-vim';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Tabs,
    Tab,
    Grid,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    Button,
    Menu,
    TextField,
} from '@mui/material';
import { Close } from '@mui/icons-material';

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
            {
                label: 'Font Size', key: 'fontSize', type: 'select', options: [
                    { label: '14px', value: 14 },
                    { label: '16px', value: 16 },
                    { label: '18px', value: 18 },
                    { label: '20px', value: 20 },
                ]
            },
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
            {
                label: 'Cursor Blinking', key: 'cursorBlinking', type: 'select', options: [
                    { label: 'Blink', value: 'blink' },
                    { label: 'Smooth', value: 'smooth' },
                    { label: 'Phase', value: 'phase' },
                    { label: 'Expand', value: 'expand' },
                    { label: 'Solid', value: 'solid' },
                ]
            },
            {
                label: 'Tab Size', key: 'tabSize', type: 'select', options: [
                    { label: '2', value: 2 },
                    { label: '4', value: 4 },
                    { label: '8', value: 8 },
                ]
            },
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
    showOptionsModal = false,
    onCloseOptionsModal = () => { },
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
    const [snippetAnchorEl, setSnippetAnchorEl] = useState(null);
    const [vimRemapAnchorEl, setVimRemapAnchorEl] = useState(null);
    const [vimRemaps, setVimRemaps] = useState([]);
    const [diagnostics, setDiagnostics] = useState([]);
    const [, setFileName] = useState('untitled.txt');
    const [selectedCategory, setSelectedCategory] = useState(FEATURE_CATEGORIES[0].name);

    function handleEditorChange(value, event) {
        if (onChange) onChange(value, event);
    }

    function handleEditorDidMount(editor) {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition(() => {
            const position = editor.getPosition();
            setStatus((s) => ({ ...s, line: position.lineNumber, col: position.column }));
        });
        if (vimMode) {
            if (vimModeRef.current) vimModeRef.current.dispose();
            vimModeRef.current = initVimMode(editor, document.getElementById('vim-status-bar'));
        }
    }

    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
                if (editorRef.current) {
                    editorRef.current.trigger('keyboard', 'editor.action.quickCommand', null);
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'v') {
                setVimMode((v) => !v);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (editorRef.current) {
            if (vimMode) {
                if (vimModeRef.current) vimModeRef.current.dispose();
                vimModeRef.current = initVimMode(editorRef.current, document.getElementById('vim-status-bar'));
            } else if (vimModeRef.current) {
                vimModeRef.current.dispose();
                vimModeRef.current = null;
            }
            setStatus((s) => ({ ...s, vim: vimMode }));
        }
    }, [vimMode]);

    function runEditorAction(action) {
        if (editorRef.current) {
            editorRef.current.trigger('keyboard', action, null);
        }
    }

    function handleToggleOption(optionKey) {
        setEditorOptions((opts) => {
            const newOpts = { ...opts };
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
            setSnippetAnchorEl(null);
        }
    }

    function handleAddVimRemap(from, to) {
        setVimRemaps((remaps) => [...remaps, { from, to }]);
        setVimRemapAnchorEl(null);
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

    const renderOptions = (opt) => {
        let isToggled = false;
        switch (opt.key) {
            case 'lineNumbers': isToggled = editorOptions.lineNumbers === 'on'; break;
            case 'minimap': isToggled = editorOptions.minimap.enabled; break;
            case 'wordWrap': isToggled = editorOptions.wordWrap === 'on'; break;
            case 'folding': isToggled = editorOptions.folding; break;
            case 'renderWhitespace': isToggled = editorOptions.renderWhitespace === 'all'; break;
            case 'bracketPairColorization': isToggled = editorOptions.bracketPairColorization.enabled; break;
            case 'guides': isToggled = editorOptions.guides.indentation; break;
            case 'inlayHints': isToggled = editorOptions.inlayHints.enabled; break;
            case 'hover': isToggled = editorOptions.hover.enabled; break;
            case 'contextmenu': isToggled = editorOptions.contextmenu; break;
            case 'formatOnType': isToggled = editorOptions.formatOnType; break;
            case 'formatOnPaste': isToggled = editorOptions.formatOnPaste; break;
            case 'autoClosingBrackets': isToggled = editorOptions.autoClosingBrackets === 'always'; break;
            case 'autoClosingQuotes': isToggled = editorOptions.autoClosingQuotes === 'always'; break;
            case 'matchBrackets': isToggled = editorOptions.matchBrackets === 'always'; break;
            default: break;
        }

        if (opt.type === 'toggle') {
            return <FormControlLabel control={<Switch checked={isToggled} onChange={() => handleToggleOption(opt.key)} />} label={opt.label} />;
        }

        if (opt.type === 'select') {
            return (
                <FormControlLabel
                    label={opt.label}
                    control={
                        <Select
                            value={opt.key === 'theme' ? theme : editorOptions[opt.key]}
                            onChange={e => {
                                if (opt.key === 'theme') setTheme(e.target.value);
                                else setEditorOptions(opts => ({ ...opts, [opt.key]: e.target.value }));
                            }}
                            size="small"
                        >
                            {opt.options.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                        </Select>
                    }
                />
            );
        }

        if (opt.type === 'action') {
            return <Button onClick={() => runEditorAction(opt.key)}>{opt.label}</Button>;
        }

        return null;
    };

    return (
        <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
            <Dialog open={showOptionsModal} onClose={onCloseOptionsModal} maxWidth="md" fullWidth>
                <DialogTitle>
                    Options
                    <IconButton onClick={onCloseOptionsModal} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Tabs value={selectedCategory} onChange={(e, newValue) => setSelectedCategory(newValue)}>
                        {FEATURE_CATEGORIES.map(cat => <Tab key={cat.name} label={cat.name} value={cat.name} />)}
                    </Tabs>
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            {FEATURE_CATEGORIES.find(cat => cat.name === selectedCategory).options.map(opt => (
                                <Grid item xs={12} sm={6} key={opt.key}>
                                    {renderOptions(opt)}
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>

            <MonacoEditor
                height="calc(100% - 28px)"
                defaultLanguage={language}
                language={language}
                value={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={theme}
                options={editorOptions}
                {...rest}
            />

            <Menu
                anchorEl={snippetAnchorEl}
                open={Boolean(snippetAnchorEl)}
                onClose={() => setSnippetAnchorEl(null)}
            >
                <MenuItem onClick={() => handleInsertSnippet('console.log($1);')}>console.log()</MenuItem>
                <MenuItem onClick={() => handleInsertSnippet('function $1() {\n  $2\n}')}>function</MenuItem>
                <MenuItem onClick={() => handleInsertSnippet('if ($1) {\n  $2\n}')}>if statement</MenuItem>
            </Menu>

            <Menu
                anchorEl={vimRemapAnchorEl}
                open={Boolean(vimRemapAnchorEl)}
                onClose={() => setVimRemapAnchorEl(null)}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6">Add Vim Key Remap</Typography>
                    <form onSubmit={e => { e.preventDefault(); handleAddVimRemap(e.target.from.value, e.target.to.value); }}>
                        <TextField name="from" label="From" size="small" />
                        <TextField name="to" label="To" size="small" />
                        <Button type="submit">Add</Button>
                    </form>
                    <Box sx={{ mt: 2 }}>
                        {vimRemaps.map((r) => <Typography key={r.from + '->' + r.to}>{r.from} → {r.to}</Typography>)}
                    </Box>
                </Box>
            </Menu>

            <input type="file" style={{ display: 'none' }} id="vim-upload-input" onChange={handleUpload} />

            <AppBar position="absolute" color="default" sx={{ top: 'auto', bottom: 0 }}>
                <Toolbar variant="dense" id="vim-status-bar">
                    <Typography variant="body2" sx={{ mr: 2 }}>Ln {status.line}, Col {status.col}</Typography>
                    <Typography variant="body2" sx={{ mr: 2 }}>{status.language}</Typography>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                        {status.vim ? `Vim Mode (Ctrl+Alt+V)` : 'Insert Mode (Ctrl+Alt+V to toggle Vim)'}
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2, color: diagnostics.length ? 'error.main' : 'inherit' }}>
                        Problems: {diagnostics.length}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>Monaco Editor • Ctrl+Shift+P</Typography>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

VimCodeEditor.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool,
    language: PropTypes.string,
    showOptionsModal: PropTypes.bool,
    onCloseOptionsModal: PropTypes.func,
};

export default VimCodeEditor;
