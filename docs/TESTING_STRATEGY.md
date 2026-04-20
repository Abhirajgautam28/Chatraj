# 🧪 Testing Strategy

This document outlines the testing standards and procedures for the ChatRaj project.

## 🏗️ Backend Testing

We use **Jest** for backend testing. Our tests are categorized into:

1.  **Unit Tests (`Backend/tests/unit/`)**:
    *   **Services**: Test business logic in isolation by mocking Mongoose models and third-party services.
    *   **Utilities**: Pure functions (e.g., `normalizeEmail`, `escapeHtml`) should have 100% test coverage.
    *   **Middleware**: Test security and error handling logic.

2.  **Controller Tests (`Backend/tests/controllers/`)**:
    *   Use `supertest` to verify HTTP status codes, headers, and response formats.
    *   Mock the underlying service layer.

3.  **Integration Tests (`Backend/tests/integration/`)**:
    *   Verify end-to-end flows like user registration -> OTP verification -> login.

### Running Tests
```bash
npm run test:backend:unit        # Run all unit tests
npm run test:backend:services    # Run service tests
npm run test:backend:coverage    # Generate coverage report
```

---

## 🎨 Frontend Testing

We use **Vitest** and **React Testing Library** for frontend testing.

1.  **Component Tests (`frontend/src/__tests__/components/`)**:
    *   Verify component rendering, user interactions, and prop behavior.
    *   Mock API calls using `vi.mock`.

2.  **Hook Tests (`frontend/src/__tests__/unit/hooks/`)**:
    *   Use `renderHook` to verify custom hook logic and state transitions.

### Running Tests
```bash
npm run test:frontend            # Run all vitest tests
```

---

## 🛡️ Best Practices

*   **Mock Dependencies**: Always mock external services (Redis, Mailer, AI) and database models in unit tests.
*   **Deterministic Tests**: Ensure tests do not rely on external state or time.
*   **Safety First**: Use utilities like `escapeHtml` for user-provided data in emails to prevent XSS.
*   **Clean Up**: Always call `jest.clearAllMocks()` in `afterEach` to prevent test leakage.
