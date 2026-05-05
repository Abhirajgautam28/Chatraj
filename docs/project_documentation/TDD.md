# ChatRaj Technical Design Document (TDD)

## 1. Introduction
This Technical Design Document defines the internal architecture, database schema constraints, and component interactions required to implement the ChatRaj specification outlined in the SRS.

---

## 2. Database Schema Design (MongoDB / Mongoose)

### 2.1 User Collection
```javascript
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String },
  resetPasswordOtp: { type: Number },
  resetPasswordOtpExpiry: { type: Date }
}, { timestamps: true });
```
**Indexing:** An index is placed on `email` to ensure $O(1)$ lookup performance during authentication.

### 2.2 Project Collection
```javascript
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  fileTree: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
```
**Data Structure Note:** `fileTree` utilizes `Schema.Types.Mixed` to allow dynamic nested object structures required to represent complex directory hierarchies.

### 2.3 Message Collection
```javascript
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
}, { timestamps: true });
```
**Indexing:** A compound index on `{ projectId: 1, createdAt: -1 }` is required to optimize chat history retrieval.

---

## 3. System Sequence Diagrams

### 3.1 Authentication & Project Initialization Sequence
1. Client `POST /api/users/login` with credentials.
2. Server queries DB, verifies bcrypt hash, signs JWT, returns to Client.
3. Client stores JWT in `localStorage` and `UserContext`.
4. Client routes to `/project/:id`.
5. Client `GET /api/projects/get-project/:id` with Bearer token.
6. Server validates token, queries DB, populates user array, returns project payload.
7. Client establishes WebSocket connection to `/` namespace.
8. Client emits `join-project` with `projectId`.
9. Server `socket.join(projectId)` and emits `user-joined` to the room.

### 3.2 Collaborative Code Execution Sequence
1. User A modifies `main.js` in the React frontend.
2. Client A triggers `onChange` handler.
3. Client A executes `updateFileState()` modifying the local `fileTree` React state.
4. Client A debounces (150ms) and emits `file-update(path, content)`.
5. Server receives `file-update` and executes `socket.to(projectId).emit('file-update')`.
6. Client B receives `file-update` and patches their local React state.
7. User A clicks "Run Code".
8. Client A instantiates `@webcontainer/api`.
9. Client A maps the React `fileTree` object into the WebContainer file system API format.
10. Client A executes `webcontainer.spawn('node', ['main.js'])`.
11. Output stream is piped to the terminal UI component on Client A's machine.

---

## 4. Frontend Component Design

### 4.1 Component Hierarchy (Project Workspace)
```text
<Project> (Top-Level Route Component)
  |-- <GlobalErrorBoundary>
  |-- <ResizablePanel>
       |-- <SidebarExplorer> (Left Pane)
            |-- <FileTreeRenderer>
            |-- <CollaboratorList>
       |-- <WorkspaceArea> (Center Pane)
            |-- <MessageList>
                 |-- <ChatMessage>
                      |-- <SyntaxHighlightedCode>
            |-- <ChatInputArea>
       |-- <CodeEditorArea> (Right Pane)
            |-- <VimCodeEditor>
            |-- <TerminalOutput>
```

### 4.2 State Management (`useProjectState` Hook)
Instead of relying on Redux, the highly volatile WebSocket state is isolated within a custom hook.
- **Inputs:** `projectId`, `socket` instance.
- **Outputs:** `projectMetadata`, `fileTree`, `messages`, `activeUsers`, `activeFile`.
- **Mutators:** `sendMessage()`, `updateFile()`, `changeActiveFile()`.

### 4.3 View Transition Theming
The frontend implements modern CSS View Transitions. When `ThemeContext.toggleTheme()` is called, the state update is wrapped in `document.startViewTransition()`. To prevent structural layout shifts, structural CSS properties (padding, flex) are strictly decoupled from thematic properties (colors, borders, shadows) via `utils/themeClasses.js`.

---

## 5. Security & Caching Strategy

### 5.1 Redis Architecture
- **Rate Limiting:** `redis.incr()` combined with `redis.expire()` ensures IP addresses cannot flood the API.
- **AI Prompt Caching:** To prevent catastrophic billing from Google Generative AI, prompts are hashed using MD5. `redis.get(hash)` intercepts redundant queries globally across all projects.
- **Session Revocation:** Logout appends the JWT to a Redis Set. The `authUser` middleware checks `redis.sismember()` before authorizing requests.

### 5.2 XSS Mitigation
User-generated content in the chat and blog systems uses Markdown. Before rendering via `dangerouslySetInnerHTML` in React, the raw HTML is piped through `DOMPurify` to strip executable script tags while preserving semantic formatting.