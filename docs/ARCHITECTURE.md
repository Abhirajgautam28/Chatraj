# ChatRaj Architecture

## System Overview
ChatRaj is a modern, real-time collaboration platform designed for developers. It leverages a MERN stack with Socket.io for live communication and Redis for performance-critical caching and session management.

## Core Pillars
1. **Real-time Engine**: Powered by Socket.io, providing instant message delivery, typing indicators, and live file synchronization.
2. **AI Integration**: Seamlessly integrated with Google Gemini API, featuring prompt caching to minimize latency and costs.
3. **Workspace Resilience**: Implements a robust project-based isolation model with advanced state management via custom hooks.
4. **Security First**: Mandatory CSRF protection, rate limiting, masked sensitive data, and comprehensive audit logging.

## Architectural Patterns
- **Backend**: Standardized Controller-Service-Model architecture ensuring clear separation of business logic from infrastructure.
- **Frontend**: Highly modular component architecture utilizing custom hooks (e.g., `useProjectState`, `useApi`) for efficient state management and side-effect handling.
- **Persistence**: Optimized MongoDB operations using atomic updates to prevent race conditions in concurrent collaboration environments.

## Directory Structure
- `Backend/`: Node.js Express server, services, and models.
- `frontend/`: Vite-powered React application.
- `docs/`: Comprehensive system and API documentation.
