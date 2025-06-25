# Changelog

All notable changes to this project will be documented in this file.  
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- Added a new feature in version 2.0.0

---

## [1.2.0] - 2025-06-25

### Added
- **AI Assistant**
  - Integrated Google Gemini-powered AI assistant for code suggestions, explanations, and file tree generation.
  - Added context-aware code completion and inline documentation support.
  - Enabled AI-driven project scaffolding and code refactoring suggestions.
  - Implemented AI-powered error explanation and debugging tips in chat.
- **Real-time Collaboration**
  - Live chat with typing indicators, emoji reactions, and message threading.
  - Support for replying to specific messages and message quoting.
  - Added real-time presence indicators for all collaborators.
  - Implemented optimistic UI updates for chat and code changes.
- **Multi-user Code Editing**
  - Real-time collaborative code editing with file tree visualization.
  - Synchronized cursor and selection positions across users.
  - Added file locking and conflict resolution for simultaneous edits.
- **Project Categories**
  - Support for organizing projects by category (e.g., DSA, Web, ML).
  - Category-based filtering and search in the dashboard.
- **File System Management**
  - File tree explorer with drag-and-drop file/folder reordering.
  - Open files tab with close, reorder, and unsaved changes indicators.
  - Code editor with syntax highlighting for multiple languages.
  - File upload, download, rename, and delete functionality.
- **Code Execution**
  - In-browser code execution using WebContainers for Node.js projects.
  - Live preview of running servers and console output.
  - Build and run commands configurable per project.
- **User Presence**
  - Online/offline status and last active time for each collaborator.
  - Notification system for user join/leave events.
- **Voice Input**
  - Speech-to-text for hands-free chat and code commands.
  - Language selection and voice command help overlay.
- **Dark/Light Mode**
  - Theme toggle for comfortable coding in any environment.
  - Automatic theme detection based on system preferences.
- **Responsive UI**
  - Fully responsive layout for desktop, tablet, and mobile devices.
  - Touch-friendly file tree and code editor controls.
- **Security**
  - JWT authentication with refresh token support.
  - Role-based access control for project and file permissions.
  - CORS configuration for secure API access.
  - Rate limiting and brute-force protection on authentication endpoints.
- **Settings**
  - Customizable interface (font size, tab width, color scheme).
  - Privacy controls for chat and project visibility.
  - Chat history management and export.
  - Notification preferences and email alerts.

### Changed
- **UI/UX**
  - Improved layout, accessibility, and animated transitions.
  - Enhanced keyboard navigation and screen reader support.
  - Updated iconography and color palette for clarity and contrast.
- **Performance**
  - Optimized socket event handling and state updates for large projects.
  - Reduced bundle size and improved initial load times.
  - Debounced file save and chat input to minimize server load.
- **Error Handling**
  - Enhanced error boundaries and user-friendly error messages.
  - Centralized logging for client and server errors.
  - Added fallback UI for network and server outages.
- **AI Integration**
  - Modularized AI service for future provider extensibility.
  - Improved prompt engineering for more accurate code suggestions.
  - Added usage analytics for AI features.

### Fixed
- **Duplicate Messages**
  - Prevented duplicate chat messages in real-time collaboration.
  - Added deduplication logic for socket and API events.
- **Code Editor Rendering**
  - Hardened code area rendering to ensure code is always visible and scrollable across environments.
  - Fixed issues with code wrapping, overflow, and font scaling.
- **SSR/Production Bugs**
  - Fixed hydration and rendering mismatches between local and production (Vercel) deployments.
  - Addressed issues with environment-specific configuration and asset loading.
- **File Tree Sync**
  - Resolved issues with file tree updates and synchronization across users.
  - Fixed race conditions in file creation, deletion, and renaming.
- **Highlight.js**
  - Updated usage to avoid deprecated APIs and ensure consistent syntax highlighting.
  - Improved language detection and fallback for unsupported file types.
- **Accessibility**
  - Fixed focus traps and improved ARIA labeling throughout the app.
  - Resolved color contrast issues in dark mode.
- **Notifications**
  - Fixed duplicate and missing notifications for user actions.
  - Improved reliability of email and in-app alerts.

### Removed
- Deprecated highlight.js API usage.
- Legacy code paths for file tree updates.
- Removed unused dependencies and polyfills.
- Obsolete chat and file sync logic replaced with new real-time engine.

---

## [1.1.0] - 2025-05-10

### Added
- **Project Management**
  - Create, join, and manage projects with unique names and categories.
  - Project invitation links and access control.
  - Project archiving and deletion.
- **Collaborator Management**
  - Add and remove users from projects.
  - Assign roles (owner, editor, viewer) to collaborators.
  - User profile pictures and display names in chat and file tree.
- **AI System Prompt**
  - Enhanced system instructions for AI code generation.
  - Customizable AI prompt templates per project.
- **Onboarding**
  - Interactive onboarding tour for new users.
  - Sample projects and templates for quick start.

### Changed
- **Backend**
  - Refactored controllers and services for scalability and maintainability.
  - Improved API versioning and documentation.
  - Switched to async/await for all database operations.
- **Frontend**
  - Improved file explorer and chat UI.
  - Refactored state management using React Context and custom hooks.
  - Updated dependencies for better performance and security.

### Fixed
- **Socket Reconnection**
  - Fixed issues with duplicate socket connections and event listeners.
  - Improved reconnection logic for unstable networks.
- **File Save**
  - Resolved file save and update race conditions.
  - Fixed file content loss on rapid edits.
- **Authentication**
  - Fixed session expiration and auto-logout bugs.
  - Improved error messages for failed logins.
- **Mobile UI**
  - Fixed layout issues on small screens and mobile browsers.

---

## [1.0.0] - 2025-04-01

### Added
- Initial release of ChatRaj: AI-powered software engineering collaboration platform.
- Core features:
  - Real-time chat with message history and search.
  - Collaborative code editor with syntax highlighting.
  - File tree explorer and project management.
  - AI assistant for code generation and explanations.
  - User authentication and project access control.
  - Responsive design for desktop and mobile.
  - Basic notification system for project events.

---

> This changelog is maintained following the guidelines of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).