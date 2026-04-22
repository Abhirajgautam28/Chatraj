import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the internal state of a project workspace.
 */
export const useProjectState = (initialProject) => {
    const [project, setProject] = useState(initialProject);
    const [messages, setMessages] = useState([]);
    const [fileTree, setFileTree] = useState(initialProject.fileTree || {});
    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [replyingTo, setReplyingTo] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedReplies, setExpandedReplies] = useState({});

    const updateFileContents = useCallback((fileName, contents) => {
        setFileTree(prev => ({
            ...prev,
            [fileName]: {
                ...prev[fileName],
                file: { ...prev[fileName].file, contents }
            }
        }));
    }, []);

    const toggleUserSelection = useCallback((id) => {
        setSelectedUserId(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    return {
        project, setProject,
        messages, setMessages,
        fileTree, setFileTree,
        currentFile, setCurrentFile,
        openFiles, setOpenFiles,
        users, setUsers,
        selectedUserId, setSelectedUserId,
        typingUsers, setTypingUsers,
        replyingTo, setReplyingTo,
        searchTerm, setSearchTerm,
        expandedReplies, setExpandedReplies,
        updateFileContents,
        toggleUserSelection
    };
};
