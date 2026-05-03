# ChatRaj Master Replication Prompt

**Instructions for the User:**
Copy the text below (starting from "MASTER PROMPT") and paste it into a highly capable LLM (like Claude 3.5 Sonnet or GPT-4o) when you require an exact, functional clone of the ChatRaj repository. Do not omit any sections.

---

## MASTER PROMPT: CHATRAJ EXACT REPLICATION

You are an elite, senior full-stack engineer. Your directive is to build an exact, functional replica of **ChatRaj**, a highly advanced, real-time collaborative IDE and chat platform. You must output the code file by file, adhering strictly to the architecture, specific packages, and state management rules defined below.

### Phase 1: Environment and Initialization
1. Initialize a monorepo containing `Backend/` and `frontend/`.
2. **Backend Dependencies:** `express`, `mongoose`, `socket.io`, `redis`, `ioredis`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`, `@google/generative-ai`, `nodemailer`, `express-validator`.
3. **Frontend Dependencies:** `react@18`, `react-dom@18`, `vite`, `tailwindcss`, `react-router-dom`, `socket.io-client`, `axios`, `@webcontainer/api`, `highlight.js`, `lucide-react`, `clsx`, `tailwind-merge`.

### Phase 2: Database Schema Definitions (Backend/models)
Generate the Mongoose schemas exactly as follows:
- `user.model.js`: `email` (String, unique), `password` (String, select: false). Implement a `pre('save')` hook utilizing `bcrypt.hash` (salt: 10). Implement `generateJWT` method returning a token signed with `JWT_SECRET`.
- `project.model.js`: `name` (String), `users` (Array of `mongoose.Schema.Types.ObjectId` ref 'User'), `fileTree` (Type: Mixed, default: `{}`).
- `message.model.js`: `text` (String), `sender` (ObjectId ref 'User'), `projectId` (ObjectId ref 'Project').
- `blog.model.js`: `title` (String), `content` (String), `likes` (Array of ObjectIds).

### Phase 3: Core API Services (Backend/services)
- Create `redis.service.js` implementing a robust `ioredis` client with error handling.
- Create `ai.service.js`. It must accept a string prompt. It must hash the prompt using Node's native `crypto.createHash('md5')`. It must check Redis (`redis.get(hash)`). On miss, it calls `google/generative-ai`, stores the result in Redis with an 86400 TTL, and returns the string.
- Create `socket.service.js`. Attach it to the HTTP server. Implement `io.on('connection')`. Handle `join-project` (socket.join), `project-message` (broadcast to room), and `file-update` (broadcast to room).

### Phase 4: Frontend State & Theming (frontend/src/context)
- Create `ThemeContext.jsx`. The state must support values: `glassmorphism`, `claymorphism`, `material`.
- Create `utils/themeTransition.js` containing `export const executeThemeTransition = (callback) => { if (!document.startViewTransition) { callback(); return; } document.documentElement.classList.add('theme-transitioning'); document.startViewTransition(() => { callback(); document.documentElement.classList.remove('theme-transitioning'); }); }`.

### Phase 5: The Workspace Engine (frontend/src/hooks/useProjectState.js)
Write a custom React hook that manages the collaborative environment.
- It must hold state for `messages` (Array), `fileTree` (Object), `activeFile` (String), and `collaborators` (Array).
- It must accept a singleton `socket` instance.
- It must initialize `useEffect` listeners for `project-message` and `file-update`.
- It must expose a `updateFile(path, content)` function that updates local state and immediately emits `file-update` to the socket.

### Phase 6: The Project Screen (frontend/src/screens/Project.jsx)
Build the primary UI layout.
- Use a CSS Grid or Flexbox split-pane layout.
- **Left Pane:** File explorer. Render the keys of `fileTree` recursively.
- **Center Pane:** Chat interface. Render `messages`. Include an input field that emits `project-message`.
- **Right Pane:** Code Editor. Use a `<textarea>` or basic code input bound to `activeFile` content. Bind the `onChange` event to `updateFile` from the custom hook.
- **WebContainer Integration:** Implement a "Run" button. When clicked, instantiate `@webcontainer/api`, map the `fileTree` object into the WebContainer file format, execute `node main.js`, and capture the `WritableStream` output into a state variable rendered in a UI terminal block.

### Execution Directive
Begin by generating the `Backend/models/user.model.js`, `Backend/services/ai.service.js`, and `frontend/src/hooks/useProjectState.js` files first. Ensure production-grade error handling.
