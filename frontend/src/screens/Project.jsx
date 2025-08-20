import React, { useRef, useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/user.context'
import { ThemeContext } from '../context/theme.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import { getWebContainer } from '../config/webContainer'
import Avatar from '../components/Avatar';
import EmojiPicker from '../components/EmojiPicker';
import FileIcon from '../components/FileIcon';
import PropTypes from 'prop-types';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import VimCodeEditor from '../components/VimCodeEditor';
import {
    Box,
    Button,
    Container,
    Grid,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    TextField,
    Modal,
    Menu,
    MenuItem,
    Switch,
    Select,
    FormControl,
    InputLabel,
    Slider,
} from '@mui/material';
import {
    Add,
    Settings,
    Search,
    Close,
    People,
    Send,
    Reply,
    InsertEmoticon,
    Check,
    DoneAll,
    Code as CodeIcon,
    PlayArrow,
    Menu as MenuIcon,
    Brightness4,
    Brightness7,
    Group,
    VpnKey,
    Palette,
    TextFields,
    Visibility,
    AccessTime,
    Assistant,
    Lock,
    Notifications,
    ArrowDownward,
    ChatBubble,
    Security,
    Translate,
    MoreVert
} from '@mui/icons-material';

// ... (keep the translations and helper functions)

const Project = () => {
    // ... (keep the state and hooks)

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Left Panel: Chat */}
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '400px', borderRight: 1, borderColor: 'divider' }}>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setIsModalOpen(true)}>
                            <Add />
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {project.name}
                        </Typography>
                        <IconButton color="inherit" onClick={() => setIsSettingsOpen(true)}>
                            <Settings />
                        </IconButton>
                        <IconButton color="inherit" onClick={() => setShowSearch(!showSearch)}>
                            <Search />
                        </IconButton>
                        <IconButton color="inherit" onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                            <People />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box ref={messageBox} sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                    {/* Render messages using Material-UI components */}
                </Box>
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter message"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={(e) => {
                            if (settings.behavior.enterToSend && e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <IconButton onClick={send}>
                                    <Send />
                                </IconButton>
                            )
                        }}
                    />
                </Box>
            </Box>

            {/* Right Panel: Code Editor and Preview */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <AppBar position="static" color="default">
                    <Toolbar>
                        {/* Open files tabs */}
                        <Box sx={{ flexGrow: 1 }}>
                            {openFiles.map((file) => (
                                <Button
                                    key={file}
                                    onClick={() => setCurrentFile(file)}
                                    variant={currentFile === file ? "contained" : "text"}
                                >
                                    {file}
                                </Button>
                            ))}
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PlayArrow />}
                            onClick={async () => {
                                // ... (run code logic)
                            }}
                        >
                            Run
                        </Button>
                    </Toolbar>
                </AppBar>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                    {/* Explorer */}
                    <Box sx={{ width: '240px', borderRight: 1, borderColor: 'divider', p: 2, overflowY: 'auto' }}>
                        {/* File tree and collaborators */}
                    </Box>
                    {/* Code Editor */}
                    <Box sx={{ flexGrow: 1, height: '100%' }}>
                        {/* CodeMirror or VimCodeEditor */}
                    </Box>
                    {/* Preview */}
                    {iframeUrl && (
                        <Box sx={{ flexGrow: 1, height: '100%' }}>
                            <iframe src={iframeUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Modals */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}>
                    {/* Add collaborators content */}
                </Box>
            </Modal>

            <Modal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }}>
                    {/* Settings content */}
                </Box>
            </Modal>

            <Modal open={isAIModalOpen} onClose={() => setIsAIModalOpen(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}>
                    {/* AI Assistant content */}
                </Box>
            </Modal>
        </Box>
    );
}

export default Project;