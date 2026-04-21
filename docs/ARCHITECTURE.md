# Project Architecture

## Overview
ChatRaj is a MERN stack application (MongoDB, Express, React, Node.js) with real-time collaboration features powered by Socket.io and AI assistance using Google Gemini.

## Components
### Frontend
- **Modular Components**: Located in `frontend/src/components/`, these are small, reusable UI units.
- **Screens**: Located in `frontend/src/screens/`, these represent main pages like Dashboard, Project, and ChatRaj.
- **Custom Hooks**: Centralized logic for state management, API calls (`useApi`), and WebGL initialization.
- **State Management**: Uses React Context API for global state (User, Theme, Toast).

### Backend
- **Controller-Service-Model**: Standardized layered architecture for clear separation of concerns.
- **Services**: Business logic for AI (`ai.service.js`), Projects (`project.service.js`), and Real-time messages (`message.service.js`).
- **Real-time**: Socket.io integration managed via `socket.service.js`.

## Key Features
- **Real-time Collaboration**: Multi-user editing and chat.
- **AI Integration**: Context-aware AI suggestions and code generation.
- **Project Isolation**: Projects are containers with their own file systems and member lists.
- **Security**: Robust CSRF protection and masked data handling for admin endpoints.
