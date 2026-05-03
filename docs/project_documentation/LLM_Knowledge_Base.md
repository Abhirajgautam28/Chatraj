# ChatRaj LLM Knowledge Base & Architectural Map

This document is engineered specifically for Large Language Model ingestion. It details the precise structural mappings, data flows, and state management paradigms of the ChatRaj monorepo to ensure perfect contextual accuracy during code generation or debugging.

---

## 1. Directory & Build System Architecture

### 1.1 Monorepo Orchestration
The root repository utilizes `concurrently` within the main `package.json` to execute the Node.js backend and the Vite/React frontend simultaneously via `npm run dev`.

### 1.2 Backend Directory Structure (`/Backend`)
- `/config`: Contains global constants (`constants.js`) and environment loading logic.
- `/controllers`: Contains discrete business logic handlers (e.g., `user.controller.js`, `ai.controller.js`).
- `/db`: Contains the Mongoose connection initialization (`db.js`).
- `/middleware`: Contains Express middleware (`authUser.js`, `rateLimiter.js`).
- `/models`: Contains strictly defined Mongoose schemas.
- `/routes`: Maps Express endpoints to specific controllers.
- `/services`: Contains abstracted, reusable logic (e.g., `socket.service.js` for WebSocket orchestration, `ai.service.js` for Google Gen AI integration).
- `/utils`: Pure functions for cryptography, caching (`cache.js`), and email templates.

### 1.3 Frontend Directory Structure (`/frontend/src`)
- `/components`: Highly modular, reusable UI fragments (e.g., `BaseModal.jsx`, `SyntaxHighlightedCode.jsx`).
- `/config`: Frontend constants and the Singleton Socket.io client instantiation (`socket.js`).
- `/context`: React Context providers (`ThemeContext.jsx`, `UserContext.jsx`).
- `/hooks`: Custom React hooks, most notably `useProjectState.js`, which encapsulates the entire workspace state machine.
- `/screens`: High-level page components mapped to React Router paths (e.g., `Project.jsx`, `Dashboard.jsx`).
- `/styles`: Global CSS and Tailwind configurations.
- `/utils`: Utility functions, notably `themeTransition.js` which manages the native View Transitions API.

---

## 2. Deep Database Schema Mappings (MongoDB)

### 2.1 The `User` Model
- **Core Fields:** `email` (String, Unique, Indexed), `password` (String, selected: false by default), `firstName` (String), `lastName` (String).
- **Hooks:** Implements a `pre('save')` hook utilizing `bcrypt.hash` with a salt factor of 10.
- **Methods:** Implements `generateJWT()`, injecting `_id`, `email`, and name fields into the payload.

### 2.2 The `Project` Model
- **Core Fields:** `name` (String), `users` (Array of ObjectIds referencing `User`), `fileTree` (Mixed Type / JSON Object).
- **FileTree Paradigm:** The `fileTree` is a nested JSON object where keys are directory/file names, and values are either objects (representing directories) or objects containing a `contents` string (representing files).

### 2.3 The `Blog` Model
- **Core Fields:** `title` (String), `content` (String, Markdown format).
- **Atomic Arrays:** Contains `likes` (Array of ObjectIds). The backend utilizes the `$addToSet` operator to prevent duplicate likes and `$pull` to remove them, ensuring race conditions do not corrupt data.

---

## 3. The Core State Machine: `useProjectState` Hook
The entire collaborative workspace is managed by `frontend/src/hooks/useProjectState.js`.

### 3.1 State Variables
- `project`: The current project metadata.
- `users`: Array of participants. Optimized via `useMemo` into a Map for $O(1)$ lookups during chat rendering.
- `messages`: Array of chat history.
- `fileTree`: The active virtual file system.
- `currentFile`: The currently active file string path.
- `openFiles`: Array of currently tabbed files.

### 3.2 WebSocket Mutators
The hook initializes listeners for `project-message`, `file-update`, and `user-joined`. When `file-update` is received, it patches the local React state immediately, leveraging a Last-Write-Wins strategy.

---

## 4. The AI Execution Workflow

### 4.1 Trigger and Interception
When a user submits a string to the chat input, the frontend evaluates it via Regex. If the string contains `@ChatRaj` or `@ai`, it emits the standard `project-message` over Socket.io, but also triggers a secondary Axios call to `GET /api/ai/get-result`.

### 4.2 Backend Caching Layer (Redis)
The `ai.service.js` receives the prompt.
1. It generates an MD5 hash of the prompt string.
2. It executes `redis.get(hash)`.
3. **Cache Hit:** If the payload exists, it returns immediately, bypassing Google APIs entirely, reducing latency from 2000ms to 20ms.
4. **Cache Miss:** It queries `@google/generative-ai`, awaits the response, executes `redis.set(hash, response, 'EX', 86400)` to cache it for 24 hours, and returns the payload.

### 4.3 Rendering the Response
The frontend receives the AI payload via the WebSocket `project-message` broadcast. The `ChatMessage.jsx` component passes the raw markdown string to `SyntaxHighlightedCode.jsx`, which parses code blocks and applies `highlight.js` themes dynamically based on the current `ThemeContext`.

---

## 5. View Transitions and Theming Architecture
ChatRaj does not simply toggle CSS classes for themes. It utilizes the modern `document.startViewTransition` API to create smooth, native-feeling screen metamorphoses.

### 5.1 The `executeThemeTransition` Utility
Located in `utils/themeTransition.js`, this function wraps state updates. To prevent browser lag during the heavy graphical transition, it temporarily injects a class into the `<html>` root that sets `animation-play-state: paused !important` for all infinite CSS animations, restoring them once the transition promise resolves.

### 5.2 CSS Architecture
Base layouts rely strictly on Tailwind utility classes. However, complex thematic elements (like Claymorphism inner shadows) are defined in `frontend/src/index.css` as custom classes (e.g., `.clay-btn`). `themeClasses.js` dynamically applies these classes based on the active `uiTheme` state.
