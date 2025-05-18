# ChatRaj – High Level Architecture

## Overview
ChatRaj is a full-stack, AI-powered software engineering collaboration platform. It combines real-time chat, collaborative code editing, project management, and AI code assistance, all built on the MERN stack with advanced integrations.

---

## Core Components

### 1. **Frontend**
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS, Animate.css, Remix Icon, Motion.js
- **Features:** Real-time chat, code editor, file explorer, project dashboard, settings, multilingual UI, voice input, and more.

### 2. **Backend**
- **Framework:** Node.js, Express
- **Database:** MongoDB (Mongoose ODM)
- **Cache/Session:** Redis
- **Authentication:** JWT
- **Real-time:** Socket.io
- **AI Integration:** Google Generative AI (Gemini), Speech Recognition, Text-to-Speech

### 3. **AI Services**
- **Gemini API** for code generation, file tree suggestions, and natural language responses.
- **Speech APIs** for voice input/output.

---

## High-Level Flow

1. **User Authentication:** JWT-based, with user data stored in MongoDB.
2. **Project Management:** Users create/join projects, each with its own file tree and collaborators.
3. **Real-time Collaboration:** Socket.io enables live chat, typing indicators, and code editing.
4. **AI Assistance:** Users can invoke AI for code suggestions, file structure, and explanations.
5. **Frontend-Backend Communication:** REST APIs for CRUD, Socket.io for real-time, and AI endpoints for code generation.

---

## Deployment & Scalability

- **Frontend:** Deployable on Vercel/Netlify.
- **Backend:** Deployable on cloud VMs or services like Heroku, with environment-based config.
- **Database:** MongoDB Atlas or self-hosted.
- **Redis:** For caching and session management.
- **AI Keys:** Per-user Gemini API key support.

---

## Security & Privacy

- JWT authentication
- Role-based access for projects
- Local storage and auto-delete for chat history
- Environment variables for secrets

---

## Extensibility

- Modular codebase (routes, services, controllers)
- Easily add new AI providers or project categories
- Pluggable UI components

---

## Diagram

```
[User] <-> [React Frontend] <-> [Express API/Socket.io] <-> [MongoDB/Redis]
                                            |
                                            v
                                     [Google Gemini AI]
```

---