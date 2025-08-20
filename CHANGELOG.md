# Changelog

All notable changes to this project will be documented in this file.  
This project adheres to [Semantic Versioning](https://semver.org/).


## Latest Features

### 2025-08-20
**Fixes & Improvements**
- Improved overall user experience by fixing various known bugs.
- Fixed a routing issue when navigating to the main blog page from a blog tile after login.
- Corrected the behavior of the light and dark mode toggle.
- Addressed a blog rendering issue in the `Blog.jsx` component.
**UI Enhancements**
- Removed the dark mode toggle from the blog section on the home page.
- Replaced the old Vite icon with the new ChatRaj branding icon.

### 2025-08-18
**Fixes & Improvements**
- Fixed an issue in the `CreateBlogForm` component where not selecting a file for the blog image would cause an error.
- Resolved a blog rendering issue on the home page.
- Ensured unique keys for each blog item to fix a rendering bug.
- Validated geometry configuration in the `ThreeHero` component to prevent errors.
- Corrected YouTube embed URL validation in the `CreateBlogForm.jsx`.
- Fixed multiple issues in the `SingleBlogPage` component, including content display and deployment problems.
- Addressed rendering issues in the `blog.jsx` component and fixed comment rendering on blog cards.
- Corrected the import of the `ThreeHero` component in `Blogs.jsx` and `SingleBlogPage.jsx`.
- Fixed the 3D effect on blog cards.
**Features & UI Enhancements**
- Added support for light and dark modes in the blog section.
- Modified the 3D hero component to use a new Three.js setup.
- Introduced 3D animations to the blog page using Three.js and anime.js.
- Upgraded the blog section UI with Material-UI components for a more modern look.
- Redesigned the Blogs section UI with modern design elements and improved responsiveness.

### 2025-08-16
**Fixes & Improvements**
- Fixed navigation issues in the Categories and Dashboard screens.
- Resolved backend and frontend routing issues.

### 2025-08-15
**Fixes & Improvements**
- Fixed an issue with the dropdown menu in the categories screen.
- Corrected a dark mode issue in `Categories.jsx`.
- Fixed category selection functionality.
- Addressed multiple animation rendering issues in the home screen chat bubble, logout screen, and other components.
- Resolved UI and styling issues on the homepage.
- Fixed animation problems in the Home, Login, and Register screens.
**Features & UI Enhancements**
- Added more customization options and a compact view to the categories screen.
- Introduced new animations to the categories page and the ChatRaj welcome screen.
- Added an animation to the rocket icon on the home page.

### 2025-08-14
**Fixes & Improvements**
- Fixed an icon rendering issue on the Project Page.
- Corrected API endpoints in the Logout components.
- Addressed various warnings in `Project.jsx` and the home page.
- Fixed the logout functionality to ensure proper session clearing.
- Resolved general rendering issues in several components.
**Features & UI Enhancements**
- Implemented visual changes and redesigned the Login, Register, and Blog pages.
- Added grid/list view switch, search button, and recent projects access to the category page.

### 2025-08-11
**Fixes & Improvements**
- Corrected API endpoints in the Blog and ProjectShowcase components.
- Fixed rendering issues in `Project.jsx` and `Login.jsx`.
- Resolved a bug preventing projects from rendering correctly in the `ProjectShowcase` component.
- Corrected the API endpoint for the user login function.
- Fixed a bug in `Home.jsx` that caused incorrect component rendering.

### 2025-08-10
**Fixes & Improvements**
- Fixed rendering issues on the Home Page.
- Addressed a category navigation bug in the Dashboard.
- Corrected issues in the user model and related UI components.
- Fixed bugs in the ChatRaj and Home screens.

### 2025-08-09
**Fixes & Improvements**
- Fixed a bug in the Blog component rendering.

### 2025-08-06
**Fixes & Improvements**
- Addressed an issue in the UserLeaderboard component.
- Fixed rendering issues in `Home.jsx` related to the user leaderboard.
- Corrected the project count display in `UserLeaderboard.jsx`.

### 2025-08-04
**Fixes & Improvements**
- Fixed known issues in project routes and the home screen.
- Resolved rendering issues on the homepage.

### 2025-08-03
**Features & UI Enhancements**
- Modified the home page to include a dark mode toggle button.

### 2025-08-02
**Fixes & Improvements**
- Fixed the OTP link in the email template to point to the correct login URL.
- Addressed several issues in user routes and controllers.
- Corrected the reset password functionality by adding an OTP sending endpoint.
**Features & UI Enhancements**
- Added 2-Factor Authentication to the password reset option for enhanced security.

### 2025-07-31
**Features & UI Enhancements**
- Added a Logout button to the Categories screen.

### 2025-07-30
**Email & Newsletter Improvements**
- Switched newsletter and OTP email delivery from Brevo/Sendinblue to Gmail SMTP for reliability.
- Improved newsletter email template with a professional design, upcoming release highlights, and community benefits.
**Features & UI Enhancements**
- Added 2FA email verification to the user registration flow.
- Added project count functionality.
**Fixes & Improvements**
- Fixed bugs in the `Categories.jsx` component.

### 2025-07-29
**Project Settings & Collaboration**
- Added advanced project settings modal with grouped options for auto-save, formatting, syntax highlighting, linting, completion, suggestions, refactoring, navigation, search, debugging, profiling, testing, deployment, versioning, and collaboration.
- Enabled real-time sync of project settings across all collaborators for seamless teamwork.

### 2025-07-02
**Code Editor & Execution**
- Code editor now always displays code, is scrollable, and features vibrant syntax highlighting (VS Code-like) in both light and dark mode.
- Syntax highlighting uses highlight.js with github/github-dark themes for a modern look.
- "Run" button shows a live backwards timer until the WebContainer is ready, then becomes enabled for code execution.

### 2025-06-25
**AI Assistant & Chat Features**
- Integrated Gemini API for AI-powered code suggestions and explanations.
- Enabled @ChatRaj mentions in chat for direct AI interaction and code help.

### 2025-05-10
**Project & Team Management**
- Project management: Create, join, and manage projects with unique names and categories.
- Collaborator management: Add/remove users, assign roles, user profile pictures in chat and file tree.
- AI system prompt: Enhanced system instructions for AI code generation.
- Interactive onboarding tour for new users.

### 2025-04-01
**Initial Release**
- ChatRaj launched: AI-powered software engineering collaboration platform.
- Core features: Real-time chat, collaborative code editor, file tree explorer, AI assistant, user authentication, responsive design, notification system.

### Added
- Major Project Page update:
  - Introduced a comprehensive Advanced Settings menu on the Project page, including options for auto-save, formatting, syntax highlighting, linting, completion, suggestions, refactoring, navigation, search, debugging, profiling, testing, deployment, versioning, and collaboration.
  - Added a scrollable, responsive settings modal for easy access to all options.
  - All settings are now persisted to the backend per project and user, with real-time sync across collaborators.

---

## [1.3.0] - 2025-07-02

### Added
- The code editor now always displays code, is scrollable, and features colorful syntax highlighting (VS Code-like) in both light and dark mode.
- Syntax highlighting uses highlight.js with github/github-dark themes for a modern look.
- The "run" button shows a live backwards timer until the WebContainer is ready, then becomes enabled for code execution.

### Fixed
- Fixed React key warnings and improved highlight.js integration for reliability.

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