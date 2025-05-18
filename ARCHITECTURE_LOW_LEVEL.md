# ChatRaj – Low Level Architecture

## Backend

### Folder Structure
- **/Backend**
  - **app.js**: Express app setup, middleware, routes.
  - **server.js**: HTTP server + Socket.io integration.
  - **/controllers**: Business logic for users, projects, AI, setup.
  - **/routes**: API endpoints for users, projects, AI, setup.
  - **/services**: Data access and business logic (project, AI, etc).
  - **/models**: Mongoose schemas (User, Project).
  - **/db**: MongoDB connection logic.
  - **/middleware**: Auth, validation, error handling.
  - **.env**: Environment variables.

### Key Flows
- **User Auth:** `/users` routes, JWT, password hashing.
- **Project CRUD:** `/projects` routes, project model, file tree updates, add users.
- **AI Integration:** `/ai` routes, `ai.service.js` for Gemini API, per-user key support.
- **Socket.io:** Real-time events for chat, typing, project collaboration.

---

## Frontend

### Folder Structure
- **/frontend/src**
  - **/screens**: Main pages (Home, Dashboard, Project, ChatRaj, Welcome, Categories).
  - **/components**: UI elements (Avatar, EmojiPicker, FileIcon, etc).
  - **/context**: React contexts for user, theme, etc.
  - **/config**: Axios, socket, web container setup.
  - **/assets**: Images, icons.
  - **/App.jsx**: Main app router and layout.
  - **/main.jsx**: Entry point.

### Key Flows
- **Authentication:** Login/register, JWT in localStorage, context for user state.
- **Project Management:** Dashboard for projects, create/join, invite users, file explorer.
- **Real-time Chat:** Project chat, message threading, emoji reactions, typing indicators.
- **Code Editing:** File tree, code editor, syntax highlighting, run code in browser (WebContainers).
- **AI Assistance:** ChatRaj screen for AI Q&A, project AI for code/file suggestions.
- **Settings:** Theme, language, privacy, sidebar, accessibility.

---

## Data Models

### User
- email, password (hashed), name, avatar, language, etc.

### Project
- name (unique), users (array), fileTree (object), category

### Message (in-memory or DB, depending on implementation)
- message, sender, projectId, timestamp, reactions, parentMessageId

---

## Real-time Events (Socket.io)
- `joinProject`, `chatMessage`, `typing`, `stop-typing`, `project-message`, `message-read`, etc.

---

## AI Service (Gemini)
- Receives prompt, system instructions, returns structured JSON (fileTree, code, text).
- Handles per-user API key.

---

## Security
- All sensitive routes protected by JWT middleware.
- Input validation via express-validator.
- CORS configured for frontend origins.

---

## Error Handling
- Centralized error handling in controllers/services.
- Frontend displays user-friendly error messages.

---

## Extensibility
- Add new routes/controllers/services for features.
- Add new frontend screens/components as needed.

---