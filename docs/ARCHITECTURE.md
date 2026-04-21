# 🏗️ ChatRaj System Architecture

This document describes the architectural patterns and testing strategy used in the ChatRaj project.

## 🧱 Backend Layers

The backend follows a strict layered architecture to ensure separation of concerns and testability:

1.  **Transport Layer (`server.js`)**:
    *   Handles HTTP server creation and Socket.io initialization.
    *   Delegates real-time logic to `socket.service.js`.

2.  **Controller Layer (`controllers/`)**:
    *   Handles incoming HTTP requests.
    *   Performs input validation (via `express-validator`).
    *   Calls business logic in the Service Layer.
    *   Formats outgoing responses using standardized utility (`utils/response.js`).

3.  **Service Layer (`services/`)**:
    *   Contains core business logic.
    *   Interacts with MongoDB via Mongoose Models.
    *   Independent of HTTP/Socket transport details.
    *   Thoroughly unit-tested.

4.  **Model Layer (`models/`)**:
    *   Defines Mongoose schemas and data validation logic.
    *   Contains static and instance methods for data manipulation (e.g., password hashing).

5.  **Utility Layer (`utils/`)**:
    *   Provides pure helper functions (e.g., email normalization, string manipulation, security helpers).

---

## 🧪 Testing Strategy

We employ a multi-tiered testing approach to maintain high code quality:

### 1. Unit Tests (`tests/unit/`)
*   **Utils**: Verified pure logic functions.
*   **Services**: Verified business logic by mocking database models.
*   **Models**: Verified schema validation and methods.

### 2. Security Tests (`tests/security/`)
*   Verified authentication middleware and sensitive data protection.

### 3. Integration Tests (`tests/integration/`)
*   Verified multi-step flows (e.g., Registration -> Verification) using `supertest`.

---

## 🚀 Execution & Automation

All tests are integrated into the root `package.json` for ease of use:

*   `npm run test:all`: Executes the full suite.
*   `npm run test:backend:unit`: Executes unit tests.
*   `npm run test:backend:coverage`: Generates a full coverage report.

Refer to `TESTING.md` for detailed command references and troubleshooting.
