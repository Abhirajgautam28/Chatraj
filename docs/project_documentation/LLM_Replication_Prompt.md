# ChatRaj: The Master Replication Prompt

**Instructions for the User:**
Copy the text below (starting from "MASTER PROMPT") and paste it into a highly capable LLM (like Claude 3.5 Sonnet, GPT-4o, or an advanced coding agent) when you want to recreate ChatRaj from scratch, migrate it, or explain the exact requirements for a clone.

---

## MASTER PROMPT: CHATRAJ REPLICATION

You are an expert full-stack developer. Your task is to build a complete clone of **ChatRaj**, a sophisticated real-time collaborative workspace for developers. You must follow these exact instructions, architectural patterns, and feature requirements without skipping any details.

### 1. Project Initialization & Structure
Create a monorepo with two sub-directories: `Backend/` (Node.js) and `frontend/` (React/Vite). Set up a root `package.json` that uses `concurrently` to run both simultaneously.

**Tech Stack Requirements:**
* **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM, Socket.io-client, Axios, `@webcontainer/api` (for in-browser execution).
* **Backend:** Node.js, Express, Mongoose (MongoDB), Redis (for caching/rate limiting), Socket.io, `@google/generative-ai`, JSON Web Tokens (JWT), Nodemailer.
* **Styling Paradigm:** Use custom Context-driven themes (Glassmorphism, Claymorphism). Do not hardcode structure classes inside theme definitions. Use the View Transitions API (`document.startViewTransition`) for theme switching.

### 2. Backend Implementation (Node.js/Express)
1. **Server Setup (`server.js`):** Initialize Express, connect to MongoDB and Redis, configure CORS to allow the frontend, and attach a Socket.io server to the HTTP instance.
2. **Database Models (`models/`):**
   * `User`: email, password (hashed via bcrypt pre-save hook), firstName, lastName, OTP fields. Add a `generateJWT` method to the schema.
   * `Project`: name, array of `users` (refs to User), `fileTree` (JSON object representing files).
   * `Message`: text, sender (ref to User), projectId, timestamp.
   * `Blog`: title, content (markdown), likes array, comments array.
3. **Authentication & Middleware:**
   * Create an `authUser` middleware that extracts the Bearer token, checks it against a Redis blacklist, and attaches the user to `req`.
   * Implement a centralized `rateLimiter.js` using Redis to protect auth routes, AI routes (`aiLimiter`), and general API routes.
4. **Controllers & Routes:**
   * **Auth:** Register, Login, Logout (blacklist token in Redis), and OTP generation (sent via Gmail SMTP using Nodemailer).
   * **Projects:** Create project, add users, fetch project details and file tree.
   * **AI:** Create an `/ai/generate` endpoint. It must take a prompt, check Redis for an MD5 hash of the prompt (cache hit), and if missed, call Google Generative AI, format the response, save to Redis, and return it.
   * **Blogs:** CRUD operations for markdown blogs with atomic MongoDB operators (`$addToSet`, `$push`) for likes/comments.
5. **Real-Time Sockets (`socket.service.js`):**
   * Listen for `join-project` and assign the user's socket to a room based on `projectId`.
   * Listen for `project-message`, save it to MongoDB, and broadcast it to the room. If the message contains `@ChatRaj`, trigger the AI service and broadcast the AI's response.
   * Listen for `file-update` (code editor changes) and broadcast to peers.

### 3. Frontend Implementation (React/Vite)
1. **Context Providers (`context/`):**
   * `UserContext`: Manage authentication state (JWT in localStorage).
   * `ThemeContext`: Manage multiple UI themes (Light/Dark, Glassmorphism, Material) persisting to localStorage. Implement `executeThemeTransition` using the View Transitions API.
   * `ToastContext`: Global notification system.
2. **Routing (`routes/`):**
   * Setup protected routes that redirect to `/login` if `UserContext` is null.
3. **Core Screens:**
   * `Register`/`Login`: Implement forms with validations, reCAPTCHA, and Axios calls to the backend.
   * `Dashboard`: Fetch and display user's projects using grid/list views. Use `useMemo` for any complex sorting.
4. **The Project Workspace (`screens/Project.jsx`) - THE MOST CRITICAL COMPONENT:**
   * **Layout:** A resizable split-pane layout (using a custom `ResizablePanel` component). Left side: Sidebar Explorer (files) & Users. Middle: Chat. Right: Code Editor.
   * **State Hooks:** Create a `useProjectState` hook to isolate workspace logic.
   * **Chat Interface:** Render messages. Use a custom `SyntaxHighlightedCode.jsx` component using `highlight.js` to render code blocks inside AI/user messages. Implement real-time search highlighting.
   * **Code Editor:** Integrate a Vim-compatible editor or standard textarea that binds to the selected file in the Sidebar.
   * **Real-time Sync:** On editor `onChange`, emit `file-update` via Socket.io (with debouncing). Listen for `file-update` to update local state instantly.
   * **WebContainers:** Add a "Run" button. When clicked, mount the current `fileTree` into `@webcontainer/api`, execute `node main.js` (or run `npm install`), and pipe output to a terminal UI component. Include a countdown timer UI while the container boots.
5. **Additional Features:**
   * `Blogs.jsx` & `SingleBlogPage.jsx`: Render markdown using specialized block renderers (headings, code, YouTube embeds).
   * Implement a global `ErrorBoundary`.
   * Pause global CSS animations (`animation-play-state: paused !important`) when the root HTML element has `.theme-transitioning` to prevent lag.

### 4. Testing & Verification Requirements
1. The backend must be testable via Jest (mocking Mongoose).
2. The frontend must be testable via Vitest. Ensure all JSX files explicitly `import React from 'react'`.
3. High-traffic loops (e.g., finding users) must use Set/Map objects for $O(1)$ lookups, not $O(N)$ arrays.

*End of Prompt. Now, execute the initialization and provide the code for `server.js` and `Project.jsx` first.*