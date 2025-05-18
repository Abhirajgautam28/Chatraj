# ChatRaj – Deep Dive

This document is a reference guide for explaining every aspect of ChatRaj, including all details and architectural reasoning.

---

## 1. **Project Purpose**
- AI-powered platform for collaborative software engineering.
- Combines real-time chat, code editing, project management, and AI code assistant.

---

## 2. **Tech Stack**
- **Frontend:** React (Vite), Tailwind CSS, Animate.css, Remix Icon, Motion.js
- **Backend:** Node.js, Express, MongoDB (Mongoose), Redis, JWT, Socket.io
- **AI:** Google Gemini API, Speech Recognition, Text-to-Speech

---

## 3. **Key Features**
- Real-time chat and code collaboration (Socket.io)
- AI code assistant (Gemini)
- Project/file management (file tree, code editor, run code)
- Multilingual, themeable, privacy-focused UI

---

## 4. **Backend**

- **app.js:** Sets up Express app, middleware, routes. Exports app for server.js.
- **server.js:** Creates HTTP server, attaches Socket.io, starts listening.
- **/controllers/**
  - `user.controller.js`: Handles user registration, login, profile.
  - `project.controller.js`: Project CRUD, add users, file tree updates.
  - `ai.controller.js`: Handles AI prompt requests.
  - `setup.controller.js`: Initial setup/config endpoints.
- **/routes/**
  - `user.routes.js`: User endpoints.
  - `project.routes.js`: Project endpoints (create, add-user, update-file-tree, etc).
  - `ai.routes.js`: AI endpoints.
  - `setup.routes.js`: Setup endpoints.
- **/services/**
  - `project.service.js`: DB logic for projects (create, add users, update file tree).
  - `ai.service.js`: Gemini API integration, system prompt, response parsing.
- **/models/**
  - `user.model.js`: User schema.
  - `project.model.js`: Project schema (name, users, fileTree, category).
- **/db/db.js:** MongoDB connection logic.
- **/middleware/**: Auth, validation, error handling.

---

## 5. **Frontend**

- **/screens/**
  - `Home.jsx`: Landing page, features, tech stack, how it works.
  - `Dashboard.jsx`: Project list, create/join project.
  - `Project.jsx`: Main project workspace (file tree, code editor, chat, collaborators).
  - `ChatRaj.jsx`: AI chat assistant.
  - `WelcomeChatRaj.jsx`: Animated welcome/loading screen.
  - `Categories.jsx`: Project categories.
- **/components/**
  - `Avatar.jsx`: User avatars.
  - `EmojiPicker.jsx`: Emoji selection for chat.
  - `FileIcon.jsx`: File type icons for file tree.
- **/context/**: User and theme context providers.
- **/config/**: Axios instance, socket setup, web container config.
- **/App.jsx**: Main router/layout.
- **/main.jsx**: Entry point.

---

## 6. **How Real-Time Collaboration Works**
- **Socket.io** connects frontend and backend.
- Users join project rooms (`joinProject` event).
- Messages, typing indicators, and code changes are broadcast in real time.
- Project file tree and code editor are synced across users.

---

## 7. **How AI Assistance Works**
- User sends prompt to `/ai` endpoint.
- Backend uses Gemini API (with per-user key) and system instructions.
- AI returns structured JSON (text, fileTree, code).
- Frontend parses and displays AI output (code, file structure, explanations).

---

## 8. **Project Management**
- Projects have unique names, categories, and collaborators.
- File tree is stored in MongoDB as a JSON object.
- Users can add collaborators, update files, and run code in browser (WebContainers).

---

## 9. **Security & Privacy**
- JWT authentication for all protected routes.
- Role-based access for projects.
- Local chat history with auto-delete options.
- CORS and environment variable management.

---

## 10. **Extensibility & Best Practices**
- Modular codebase: easy to add new features.
- Clear separation of concerns (controllers, services, models).
- Scalable real-time architecture.
- AI integration is pluggable for future providers.

---
