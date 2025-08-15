import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ChatRajThemeContext } from '../context/chatraj-theme.context';
import { UserContext } from '../context/user.context';
import { useNavigate } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText,
    IconButton, TextField, Paper, Avatar, Dialog, DialogTitle, DialogContent, Tabs, Tab,
    Switch, FormControlLabel, Select, MenuItem, Button, InputAdornment, CircularProgress,
    FormControl, InputLabel
} from '@mui/material';
import {
    Menu as MenuIcon, Add, Settings, ArrowBack, Mic, Send, Search, Close, SmartToy,
    Newspaper, MicOff
} from '@mui/icons-material';

const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${dateString} ${timeString}`;
};

const ChatRaj = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [, setIsSpeaking] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState(0);
    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('chatrajSettings');
        const defaultSettings = {
            display: { darkMode: false, theme: { primary: '#1976d2' }, typography: { userMessageSize: 'body1', aiMessageSize: 'body1' }, chatBubbles: { roundness: 16, shadow: true } },
            behavior: { enterToSend: true, autoComplete: true },
            accessibility: { language: 'en-US' },
            sidebar: { width: 260, showUserInfo: true, autoExpand: false, showTimestamps: true },
            privacy: { saveHistory: true, autoDelete: { enabled: false, days: 30 } }
        };
        return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    });
    const messageEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const { user } = useContext(UserContext);

    const languages = { 'en-US': { name: 'English (US)' }, 'hi-IN': { name: 'हिंदी (Hindi)' }, 'es-ES': { name: 'Español (Spanish)' }, 'fr-FR': { name: 'Français (French)' }, 'de-DE': { name: 'Deutsch (German)' }, 'ja-JP': { name: '日本語 (Japanese)' } };
    const t = (key) => key; // Simplified for brevity

    const speakResponse = useCallback((text) => { /* ... snip ... */ }, []);
    const handleSubmit = useCallback(async (e, voiceInput = null) => { /* ... snip ... */ }, [inputMessage, speakResponse]);

    useEffect(() => { /* ... snip ... */ }, [handleSubmit, inputMessage, speakResponse]);
    useEffect(() => { /* ... snip ... */ }, [settings]);
    useEffect(() => { /* ... snip ... */ }, [messages, settings.behavior?.autoScroll]);

    const handleSettingsChange = (category, key, value) => {
        setSettings(prev => ({ ...prev, [category]: { ...prev[category], [key]: value } }));
    };
    const handleNestedSettingsChange = (category, subCategory, key, value) => {
        setSettings(prev => ({ ...prev, [category]: { ...prev[category], [subCategory]: { ...prev[category][subCategory], [key]: value } } }));
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" onClick={() => setIsSidebarOpen(!isSidebarOpen)} edge="start" sx={{ mr: 2 }}><MenuIcon /></IconButton>
                    <SmartToy sx={{ mr: 1 }} />
                    <Typography variant="h6" noWrap>ChatRaj</Typography>
                </Toolbar>
            </AppBar>
            <Drawer variant="persistent" open={isSidebarOpen} sx={{ width: settings.sidebar.width, flexShrink: 0, '& .MuiDrawer-paper': { width: settings.sidebar.width, boxSizing: 'border-box' } }}>
                <Toolbar />
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: 2 }}><Button variant="contained" fullWidth startIcon={<Add />} onClick={() => setMessages([])}>{t('newChat')}</Button></Box>
                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}></Box>
                    <List>
                        {settings.sidebar.showUserInfo && user && <ListItem><ListItemIcon><Avatar>{user.firstName?.[0]}</Avatar></ListItemIcon><ListItemText primary={user.firstName} /></ListItem>}
                        <ListItem button onClick={() => navigate('/categories')}><ListItemIcon><ArrowBack /></ListItemIcon><ListItemText primary="Categories" /></ListItem>
                        <ListItem button onClick={() => navigate('/blogs')}><ListItemIcon><Newspaper /></ListItemIcon><ListItemText primary="Blogs" /></ListItem>
                        <ListItem button onClick={() => setIsSettingsOpen(true)}><ListItemIcon><Settings /></ListItemIcon><ListItemText primary={t('settings')} /></ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 2, ml: isSidebarOpen ? `${settings.sidebar.width}px` : 0, transition: (theme) => theme.transitions.create('margin', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }), display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <Toolbar />
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                    {messages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: '20vh' }}>
                            <SmartToy sx={{ fontSize: 60, color: 'primary.main' }} />
                            <Typography variant="h5">{t('welcomeMessage')}</Typography>
                            <Typography variant="body2" color="text.secondary">{t('welcomeSubtext')}</Typography>
                        </Box>
                    ) : (
                        messages.map((message, index) => (
                            <Box key={index} sx={{ display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
                                <Paper sx={{ p: 1.5, borderRadius: settings.display.chatBubbles.roundness, boxShadow: settings.display.chatBubbles.shadow ? 3 : 0, bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper', color: message.type === 'user' ? 'primary.contrastText' : 'text.primary' }}>
                                    <Typography variant={message.type === 'user' ? settings.display.typography.userMessageSize : settings.display.typography.aiMessageSize}>{message.content}</Typography>
                                    {settings.sidebar.showTimestamps && <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1, opacity: 0.7 }}>{formatMessageTime(message.timestamp)}</Typography>}
                                </Paper>
                            </Box>
                        ))
                    )}
                    {isThinking && <CircularProgress size={24} />}
                    <div ref={messageEndRef} />
                </Box>
                <Paper sx={{ p: 2, mt: 'auto' }}>
                    <form onSubmit={handleSubmit}>
                        <TextField fullWidth variant="outlined" placeholder="Message ChatRaj..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><IconButton onClick={() => setIsListening(!isListening)} color={isListening ? 'primary' : 'default'}><Mic /></IconButton></InputAdornment>,
                                endAdornment: <InputAdornment position="end"><IconButton type="submit" disabled={!inputMessage.trim() || isThinking}><Send /></IconButton></InputAdornment>
                            }} />
                    </form>
                    <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>{t('disclaimer')}</Typography>
                </Paper>
            </Box>
            <Dialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>{t('settings')}<IconButton onClick={() => setIsSettingsOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton></DialogTitle>
                <DialogContent dividers>
                    <Tabs value={activeSettingsTab} onChange={(e, val) => setActiveSettingsTab(val)}><Tab label="Display" /><Tab label="Behavior" /><Tab label="Accessibility" /><Tab label="Sidebar" /><Tab label="Privacy" /></Tabs>
                    <Box sx={{ p: 2 }}>
                        {activeSettingsTab === 0 && <Box>
                            <FormControlLabel control={<Switch checked={settings.display.darkMode} onChange={(e) => handleSettingsChange('display', 'darkMode', e.target.checked)} />} label={t('darkMode')} />
                            <FormControl fullWidth margin="normal"><InputLabel>Roundness</InputLabel><Select value={settings.display.chatBubbles.roundness} onChange={(e) => handleNestedSettingsChange('display', 'chatBubbles', 'roundness', e.target.value)}><MenuItem value={4}>Minimal</MenuItem><MenuItem value={16}>Normal</MenuItem><MenuItem value={24}>Large</MenuItem></Select></FormControl>
                        </Box>}
                        {activeSettingsTab === 1 && <Box><FormControlLabel control={<Switch checked={settings.behavior.enterToSend} onChange={(e) => handleSettingsChange('behavior', 'enterToSend', e.target.checked)} />} label="Enter to Send" /></Box>}
                        {activeSettingsTab === 2 && <Box><FormControl fullWidth><InputLabel>Language</InputLabel><Select value={settings.accessibility.language} onChange={(e) => handleSettingsChange('accessibility', 'language', e.target.value)}>{Object.entries(languages).map(([code, lang]) => (<MenuItem key={code} value={code}>{lang.name}</MenuItem>))}</Select></FormControl></Box>}
                        {activeSettingsTab === 3 && <Box><FormControlLabel control={<Switch checked={settings.sidebar.autoExpand} onChange={(e) => handleSettingsChange('sidebar', 'autoExpand', e.target.checked)} />} label="Auto Expand on Hover" /></Box>}
                        {activeSettingsTab === 4 && <Box><FormControlLabel control={<Switch checked={settings.privacy.saveHistory} onChange={(e) => handleSettingsChange('privacy', 'saveHistory', e.target.checked)} />} label="Save Chat History" /><Button variant="contained" color="error" onClick={() => setMessages([])}>Clear History</Button></Box>}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

ChatRaj.propTypes = {
    isListening: PropTypes.bool,
};

export default ChatRaj;