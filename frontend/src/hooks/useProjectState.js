import { useState, useCallback, useMemo } from 'react';
import axios from '../config/axios';
import { useToast } from '../context/toast.context';

export const useProjectState = (initialProject) => {
    const [project, setProject] = useState(initialProject);
    const [messages, setMessages] = useState([]);
    const [fileTree, setFileTree] = useState(initialProject?.fileTree || {});
    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [replyingTo, setReplyingTo] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedReplies, setExpandedReplies] = useState({});

    const updateFileContents = useCallback((path, contents) => {
        setFileTree(prev => ({
            ...prev,
            [path]: {
                ...prev[path],
                file: { contents }
            }
        }));
    }, []);

    const toggleUserSelection = useCallback((userId) => {
        setSelectedUserId(prev => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
    }, []);

    const clearMessages = useCallback(() => setMessages([]), []);

    return {
        project, setProject,
        messages, setMessages,
        fileTree, setFileTree,
        currentFile, setCurrentFile,
        openFiles, setOpenFiles,
        users, setUsers,
        selectedUserId,
        typingUsers, setTypingUsers,
        replyingTo, setReplyingTo,
        searchTerm, setSearchTerm,
        expandedReplies, setExpandedReplies,
        updateFileContents,
        toggleUserSelection,
        clearMessages
    };
};
