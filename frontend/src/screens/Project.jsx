import React, { useRef, useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import { ThemeContext } from '../context/theme.context';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import Markdown from 'markdown-to-jsx';
import { getWebContainer } from '../config/webContainer';
import Avatar from '../components/Avatar';
import EmojiPicker from '../components/EmojiPicker';
import FileIcon from '../components/FileIcon';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import VimCodeEditor from '../components/VimCodeEditor';
import {
    Box, Grid, Paper, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem,
    ListItemIcon, ListItemText, Button, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Tabs, Tab, Switch, FormControlLabel, Select, MenuItem, InputAdornment,
    CircularProgress, Menu
} from '@mui/material';
import {
    Menu as MenuIcon, Add, Settings, ArrowBack, Mic, Send, Search, Close, SmartToy,
    Newspaper, People, MoreVert, RunCircle, Edit, Delete, Folder, InsertDriveFile
} from '@mui/icons-material';

// Simplified for brevity
const Project = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
    const [project, setProject] = useState(location.state.project);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [fileTree, setFileTree] = useState({});
    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [isChatDrawerOpen, setChatDrawerOpen] = useState(true);
    const [isFileDrawerOpen, setFileDrawerOpen] = useState(true);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState(0);

    // Mock functionality
    const send = () => {
        if (!message.trim()) return;
        setMessages([...messages, { sender: user, message, createdAt: new Date().toISOString() }]);
        setMessage('');
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <AppBar position="fixed"><Toolbar><Typography variant="h6">{project.name}</Typography></Toolbar></AppBar>
            <Drawer variant="persistent" open={isFileDrawerOpen}>
                <Toolbar />
                <List>
                    {Object.keys(fileTree).map(file => (
                        <ListItem button key={file} onClick={() => setCurrentFile(file)}>
                            <ListItemIcon><InsertDriveFile /></ListItemIcon>
                            <ListItemText primary={file} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, ml: isFileDrawerOpen ? '240px' : 0 }}>
                <Toolbar />
                <Grid container spacing={2} sx={{ height: 'calc(100vh - 64px)' }}>
                    <Grid item xs={8}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography>{currentFile || 'No file selected'}</Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                <CodeMirror value={fileTree[currentFile]?.file.contents || ''} extensions={[javascript()]} theme={isDarkMode ? 'dark' : 'light'} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                                {messages.map((msg, i) => (
                                    <Box key={i} sx={{ mb: 2, textAlign: msg.sender._id === user._id ? 'right' : 'left' }}>
                                        <Paper sx={{ p: 1, display: 'inline-block', bgcolor: msg.sender._id === user._id ? 'primary.main' : 'grey.300' }}>
                                            <Typography variant="body2">{msg.message}</Typography>
                                        </Paper>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                <TextField fullWidth variant="outlined" value={message} onChange={e => setMessage(e.target.value)}
                                    InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={send}><Send /></IconButton></InputAdornment> }} />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Project;