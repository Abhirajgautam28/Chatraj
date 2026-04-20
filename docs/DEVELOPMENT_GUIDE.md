# 🚀 Development Guide

Welcome to ChatRaj! This guide will help you maintain the quality and consistency of the project.

## 🏗️ Backend Architecture

We follow a layered architecture:

1.  **Routes**: Define endpoints and apply middleware (auth, rate limits).
2.  **Controllers**: Handle HTTP requests, validate input, and delegate to services. **Always use the `response` utility** for consistent API outputs.
3.  **Services**: Contain the core business logic. They should be agnostic of HTTP and can be tested in isolation.
4.  **Models**: Mongoose schemas and database-level logic.
5.  **Utils**: Pure, stateless helper functions.

## 🛡️ Security Standards

*   **Sensitive Data**: Never return passwords, OTPs, or API keys in API responses. Explicitly `delete` these fields from objects before sending.
*   **XSS Protection**: All user-provided strings interpolated into HTML (especially emails) MUST be escaped using the `escapeHtml` utility.
*   **CSRF**: All non-safe HTTP methods (POST, PUT, DELETE) require a valid CSRF token. The project supports both cookie-based and signed stateless fallback tokens.
*   **Rate Limiting**: Protect sensitive endpoints (Login, Register) using the `sensitiveLimiter`.

## 📝 Coding Conventions

*   **Imports**: Use ES modules. Include `.js` extensions in local imports.
*   **Error Handling**: Throw descriptive errors in services and catch them in controllers. The `errorHandler` middleware will format them correctly.
*   **Async/Await**: Always use `try/catch` in controllers and middleware.

## 🧪 Testing

Before submitting a PR, ensure that:
1. New logic has corresponding unit tests.
2. `npm run test:all` passes successfully.
3. No sensitive data is leaked in logs or responses.
