# 🛠️ ChatRaj Development Guide

This guide is intended for developers working on the ChatRaj project. It outlines our architectural standards, coding patterns, and workflows.

## 🏗️ Architectural Overview

We use a **layered backend architecture** to maintain separation of concerns:

*   **Routes**: Express routers that define endpoints and apply middleware.
*   **Controllers**: Handle request/response logic, input validation, and delegate to services.
*   **Services**: The core business logic layer. Services should be transport-agnostic (unaware of HTTP or WebSockets).
*   **Models**: Mongoose schemas and database-specific logic.
*   **Utils**: Pure utility functions used across layers.

## 📝 Coding Standards

### Backend (Node.js ESM)

1.  **Named Exports**: Use named exports for utilities and services to ensure better IDE support and explicit imports.
2.  **Standardized Responses**: Always use `utils/response.js` for API outputs.
3.  **Error Handling**: Throw descriptive errors in services; let the global `error.middleware.js` handle formatting and logging.
4.  **Lean Queries**: Use `.lean()` for read-only Mongoose queries to improve performance.

### Frontend (React + Vite)

1.  **Functional Components**: Use hooks and functional components exclusively.
2.  **Component Modularization**: Keep components small and focused. Extract sub-components (like `ProjectCard`) from larger screens.
3.  **Context for State**: Use React Context for global state (Theme, User, Toast) instead of prop-drilling.
4.  **Prop Types**: Define `PropTypes` for all component inputs to ensure type safety.

## 🚀 Workflows

### Adding a New API Endpoint

1.  **Model**: Define/Update the Mongoose schema in `Backend/models/`.
2.  **Service**: Implement the business logic in `Backend/services/`.
3.  **Controller**: Wrap the service call and handle validation in `Backend/controllers/`.
4.  **Route**: Register the controller in `Backend/routes/` and apply `authUser` middleware.
5.  **Test**: Add a unit test in `Backend/tests/unit/services/` for the new logic.

### Creating a New Frontend Page

1.  **Screen**: Create the main component in `frontend/src/screens/`.
2.  **Route**: Add the route to `frontend/src/routes/AppRoutes.jsx`.
3.  **Components**: Break down the screen into reusable pieces in `frontend/src/components/`.
4.  **API**: Use the `useApi` hook for all backend interactions.

## 🧪 Testing Strategy

*   **Unit Tests**: Use Jest for backend and Vitest for frontend.
*   **Manual Verification**: Use the provided scripts in `package.json` to verify logic in environments where automated tools are restricted.
*   **Mocking**: Always mock database models and external services (like AI) in unit tests.

---

*Happy Coding!*
