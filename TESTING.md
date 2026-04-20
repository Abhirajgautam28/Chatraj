# 🧪 Testing Guide for ChatRaj

This document provides instructions on how to run various types of tests in the ChatRaj project.

## 🚀 Quick Start: Run All Tests

To run all unit and integration tests (backend and frontend):

```bash
npm run test:all
```

---

## 🏗️ Backend Testing

The backend tests are organized into a hierarchical structure:

### 1. Unit Tests
Focus on individual logic components.

- **Utilities:** `npm run test:backend:utils`
- **Services:** `npm run test:backend:services`
- **Models:** `npm run test:backend:models`
- **Full Unit Suite:** `npm run test:backend:unit`

### 2. Security Tests
Focus on authentication and data protection.

- **Commands:** `npm run test:backend:security`

### 3. Integration Tests
Focus on multi-step flows and component interactions.

- **Commands:** `npm run test:backend:integration`

---

## 💻 Frontend Testing

Frontend tests use **Vitest** and **React Testing Library**.

### 1. Unit Tests (Hooks & Utils)
Tests the core logic of the React application.

```bash
npm run test:frontend:unit
```

### 2. Component Tests
Tests the rendering and interaction of reusable UI components.

```bash
npm run test:frontend:components
```

---

## 🎭 End-to-End Testing (Cypress)

Cypress tests provide full browser automation.

### Run Cypress in Headless Mode

```bash
cd frontend && npm run cypress:run
```

---

## 🛠️ Troubleshooting

### Jest & Babel Issues (e.g., "Cannot find module '@babel/preset-env'")
The development environment might have broken Babel dependencies, causing Jest to fail. You can still verify backend utilities using the following Node.js commands from the `Backend` directory:

- **Email Utility:**
  ```bash
  node -e 'import { normalizeEmail } from "./utils/email.js"; console.log(normalizeEmail("test@example.com"))'
  ```

### Vitest Issues
Ensure `node_modules` are correctly installed. If `vitest` is not found, try running with `npx vitest`.
