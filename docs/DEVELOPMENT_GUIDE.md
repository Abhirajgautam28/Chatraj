# Development Guide

## Local Setup
1. **Prerequisites**: Node.js (v18+), MongoDB, Redis.
2. **Environment**: Copy `.env.example` to `.env` in both `Backend/` and `frontend/`.
3. **Installation**: Run `npm install` in both directories.
4. **Running**:
   - Backend: `npm run dev` (starts on port 8080 by default).
   - Frontend: `npm run dev` (starts on port 5173).

## Key Patterns
- **API Requests**: Always use the `useApi` hook in the frontend. It provides standard loading/error states.
- **Components**: Prefer functional components with `React.memo` for performance.
- **State**: Complex screen state should be extracted into specialized hooks (e.g., `useProjectState`).
- **Real-time**: Use the `useSocket` hook for project-specific real-time events.

## Code Standards
- Use `logger` utility for all logging.
- Ensure all components have `PropTypes`.
- Wrap the application in the `GlobalErrorBoundary`.
- Use atomic MongoDB operations for any collaborative data (likes, comments, etc.).
