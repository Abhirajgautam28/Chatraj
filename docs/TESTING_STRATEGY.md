# 📐 Testing Strategy

ChatRaj employs a "Testing Pyramid" approach to ensure a reliable and maintainable codebase.

## 🔼 The Pyramid

1.  **Unit Tests (Base)**:
    *   Found in `Backend/tests/unit/` and `frontend/src/__tests__/unit/`.
    *   Fast, isolated tests for utilities and services.
    *   Goal: 100% logic coverage for core functions.

2.  **Security Tests**:
    *   Found in `Backend/tests/security/`.
    *   Verifies authentication middleware and data protection logic.

3.  **Integration Tests**:
    *   Found in `Backend/tests/integration/`.
    *   Tests multi-component flows using `supertest` and in-memory mocks.

4.  **End-to-End (E2E) Tests (Top)**:
    *   Managed by **Cypress**.
    *   Tests real browser interactions and full system flows.

## ✅ Verification Policy

- All new features **must** include corresponding unit tests.
- Bug fixes **should** include a regression test.
- CI/CD pipelines execute the full suite on every pull request.
