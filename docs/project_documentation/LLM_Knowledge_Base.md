# ChatRaj: Comprehensive Project & Codebase Details (LLM Knowledge Base)

This document serves as an extremely detailed map of the ChatRaj monorepo. It is designed to be ingested by an LLM to provide immediate, deep context into how the frontend, backend, database, and specific utilities interact down to the granular level of button clicks, database queries, and architectural patterns.

---

## 1. Directory Structure Overview
ChatRaj is a monorepo containing two main directories: `Backend/` (Node.js/Express) and `frontend/` (React/Vite).
* Both have their own `package.json` files.
* A root `package.json` utilizes `concurrently` to run both environments via `npm run dev`.
* Both directories have their own `.env` requirements (see `README.md`).

---

## 2. Global Architecture & Core Principles

### 2.1 Database & Caching
* **Primary DB:** MongoDB Atlas. Mongoose is used for ODM. Models are defined in `Backend/models/` (e.g., `user.model.js`, `project.model.js`).
* **Caching:** Redis is used extensively for caching high-traffic endpoints and AI prompts to minimize API latency and costs.
* **Schema Design:**
  * `User`: Holds auth details, hashed passwords (bcrypt), and references.
  * `Project`: Holds project metadata, a `users` array (references to `User`), and `fileTree` structures.
  * `Message`: Chat history tied to a `projectId`.
  * `Blog`: Supports markdown content, likes (`$addToSet`), and nested comments.

### 2.2 Security & Rate Limiting
* **Middleware:** Located in `Backend/middleware/`.
* **Rate Limiter:** Centralized in `rateLimiter.js`. Uses Redis to track IPs. Protects auth routes, AI routes (`aiLimiter`), and general API endpoints.
* **Authentication:** JWT-based. `authUser` middleware checks the `Authorization` header, extracts the token, checks if it's blacklisted (in Redis), and attaches the `req.user` object.

### 2.3 Frontend State & Theming
* **State Management:** Heavy reliance on React Context (`UserContext`, `ThemeContext`, `ToastProvider`) and specialized hooks (e.g., `useProjectState.js` isolates project logic).
* **Theming API:** The View Transitions API is used for theme switching. Managed by `executeThemeTransition` in `frontend/src/utils/themeTransition.js`. CSS classes (e.g., Claymorphism `.clay-btn`) are strictly defined in `themeClasses.js` to avoid structural shifting.

---

## 3. Deep Dive User Journeys & Technical Workflows

### 3.1 User Registration & Authentication Flow
1. **Frontend Action:** User navigates to `frontend/src/screens/Register.jsx` and clicks "Sign Up".
2. **Frontend Logic:** Validation occurs. An `axios.post` request is sent to `${VITE_API_URL}/users/register`.
3. **Backend Route:** Request hits `Backend/routes/user.routes.js` `->` `POST /register`. Rate limiting is checked.
4. **Backend Controller:** `user.controller.js` `createUserController`.
   * Validates input using `express-validator`.
   * Hashes the password using `bcrypt` (handled inside `user.model.js` pre-save hook).
   * Creates the user in MongoDB.
   * Generates a JWT using `user.generateJWT()`.
5. **Response:** Sends back `{ user, token }`.
6. **Frontend Resolution:** `Register.jsx` saves the token to `localStorage`, updates the `UserContext`, and redirects to `/dashboard`.

### 3.2 The Project Workspace Flow (The Core Application)
1. **Frontend Action:** User clicks a project card on the `Dashboard.jsx`.
2. **Navigation:** React Router routes to `/project` rendering `Project.jsx`.
3. **Data Fetching:**
   * `Project.jsx` uses `useLocation` to get the `projectId` state.
   * Triggers an API call to `GET /projects/get-project/:projectId` to fetch project details (users, file tree).
   * Triggers an API call to fetch chat history.
4. **WebSocket Initialization:**
   * `frontend/src/config/socket.js` establishes a connection.
   * `Project.jsx` emits the `join-project` event with the `projectId`.
5. **Backend Socket Handling:**
   * `Backend/server.js` initializes `socket.io`.
   * The server listens for `join-project` and adds the socket to a specific `room` matching the `projectId`.
6. **Chat Messaging (The "Aha" Feature):**
   * User types a message in the chat input inside `Project.jsx` (or a sub-component like `MessageList`).
   * Clicks "Send".
   * Frontend emits `project-message` via socket.
   * **Backend:** Server receives `project-message`, saves it to MongoDB via `message.model.js`, and broadcasts it to the room.
   * **AI Trigger:** If the message text includes `@ChatRaj` or `@ai`, the backend (or frontend, depending on the exact patch level) triggers a secondary flow...

### 3.3 AI Assistant Workflow (@ChatRaj Mention)
1. **Trigger:** Message containing `@ChatRaj` is sent.
2. **Backend/Frontend Router:** An API call is made to `Backend/routes/ai.routes.js` `->` `GET /get-result?prompt=...`
3. **Controller/Service:** `ai.controller.js` calls `ai.service.js`.
4. **Caching:** `ai.service.js` hashes the prompt using MD5. It checks Redis: `redis.get(hash)`.
   * **Cache Hit:** Returns cached JSON immediately.
   * **Cache Miss:** Formats the prompt (injecting current file context if applicable), calls the `@google/generative-ai` API, receives the response, parses it using `Backend/utils/ai.js`, stores it in Redis, and returns it.
5. **Frontend Rendering:** `Project.jsx` receives the AI message. The markdown and potential code blocks are parsed. `SyntaxHighlightedCode.jsx` is used to render the code with Highlight.js.

### 3.4 Multi-User Code Editing & WebContainers Flow
1. **File Selection:** User clicks a file in the `SidebarExplorer` (part of the project layout).
2. **Editor Update:** The `VimCodeEditor.jsx` (or standard textarea depending on settings) is populated with the file content.
3. **Typing/Editing:** As the user types, an `onChange` handler fires.
4. **Socket Broadcast:** Frontend emits a `file-update` event over Socket.io, containing the file path and new content. Debouncing is applied to prevent network flooding.
5. **Peer Sync:** Other users in the room receive the `file-update` event and their local state is updated, rendering the new code instantly.
6. **Execution (Run Button):** User clicks "Run Code".
7. **WebContainer Action:** The frontend utilizes `@webcontainer/api`. It mounts the current in-memory file system into the browser-based Node.js sandbox, runs `npm install` (if package.json exists) or executes the file via `node filename.js`. Output is piped back to the terminal UI component.

---

## 4. Key Utilities & Optimization Patterns

### 4.1 Redis Caching & Batching
* Found in `Backend/utils/cache.js`. Use `withCache` for read-heavy routes.
* Maintenance scripts (like `find_and_clean_logout_keys.js`) use loop-based Sets for $O(1)$ lookups and batch Redis deletions (`redis.del(...keys)`) to minimize network round-trips.
* MongoDB operations in hot-paths use `bulkWrite` and `$in` queries instead of $O(N)$ loop queries.

### 4.2 Frontend Performance
* Large lists (like `users` in a project) use `useMemo` to create Maps for $O(1)$ lookups rather than `.find()` inside render loops.
* Infinite CSS animations are paused (`animation-play-state: paused !important`) during View Transitions (`executeThemeTransition`) to prevent lag.

### 4.3 Email & OTP
* Handled in `Backend/utils/email.js` and `Backend/utils/templates.js`. Uses Nodemailer with Gmail SMTP.
* `normalizeEmail` strictly lowercases domains. OTPs are stored securely in Redis and masked during retrieval (`adminGetOtpController`).

---

## 5. Testing Methodologies
* **Backend Unit Tests:** Use Jest (`npm run test:backend:unit`). Mocks Mongoose and internal services.
* **Frontend Unit Tests:** Use Vitest (`npm run test:frontend:unit`). Requires explicit `import React from 'react'` in JSX files.
* **E2E Visual Tests:** Playwright is used via standalone Python scripts (`playwright.async_api`) to capture screenshots and videos of user flows. Cypress is also configured (`npm run test:e2e`).

---

## 6. How to Extend This Project (For LLMs)
If asked to add a feature:
1. **Database:** Add schema to `Backend/models/`.
2. **Backend API:** Create a route in `Backend/routes/`, map it to a controller in `Backend/controllers/`. Implement business logic in `Backend/services/`. Ensure validation and rate-limiting.
3. **Frontend API:** Create/update `axios` calls in the relevant frontend screen.
4. **Frontend UI:** Use existing components from `frontend/src/components/` (e.g., `BaseModal`, `Card`). Respect the `ThemeContext` and `themeClasses.js` rules.
5. **Real-time:** If it requires real-time sync, update `Backend/server.js` (Socket.io events) and `frontend/src/config/socket.js`.