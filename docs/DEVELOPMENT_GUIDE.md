# 🛠️ Development Guide

This guide provides information on how to develop, debug, and contribute to the ChatRaj project.

## 💻 Local Setup

1.  **Environment Variables**: Ensure `Backend/.env` and `frontend/.env` are correctly configured.
2.  **Start Dev Servers**: Use `npm run dev` in the root directory to start both backend and frontend.

## 📐 Coding Standards

- **Backend**:
    - Use the **Service Layer** for all business logic.
    - Keep controllers thin; they should only handle request parsing and response formatting.
    - Use the `Backend/utils/response.js` utility for consistent JSON responses.
    - Always add unit tests in `Backend/tests/unit/` for new services or utilities.
- **Frontend**:
    - Use functional components and React hooks.
    - Memoize derived data with `useMemo` where appropriate.
    - Place shared logic in `frontend/src/utils/` or custom hooks.

## 🐛 Debugging Tips

- **Backend**: Use `console.log` or a debugger. Check `Backend/logs/` if applicable.
- **Frontend**: Use React Developer Tools and the browser's console.
- **Testing**: Run specific tests using `npx jest path/to/test` to isolate issues.
