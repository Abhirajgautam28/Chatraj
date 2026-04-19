# 🧪 Testing Guide for ChatRaj

This document provides instructions on how to run various types of tests in the ChatRaj project.

## 🚀 Quick Start: Run All Tests

To run all unit tests (backend utilities and frontend components):

```bash
npm run test:all
```

---

## 🏗️ Backend Testing

### 1. Unit Tests (Utilities)
These tests cover pure logic in `Backend/utils/`.

```bash
npm run test:backend:utils
```

### 2. Smoke Tests
Checks if the backend is running and basic endpoints are reachable.
*Note: Backend server must be running.*

```bash
npm run smoke-test
```

### 3. Lightweight E2E Tests
Runs a registration and public endpoint flow.
*Note: Backend server must be running.*

```bash
npm run smoke-test:e2e
```

---

## 💻 Frontend Testing

### 1. Unit & Component Tests (Vitest)
These tests cover React components and frontend logic.

```bash
npm run test:frontend
```

---

## 🎭 End-to-End Testing (Cypress)

Cypress tests are located in the `cypress/` directory.

### Run Cypress in Headless Mode

```bash
npx cypress run
```

### Open Cypress Test Runner (Interactive)

```bash
npx cypress open
```

---

## 🛠️ Troubleshooting

### Jest & Babel Issues (e.g., "Cannot find module '@babel/preset-env'")
The development environment might have broken Babel dependencies, causing Jest to fail. You can still verify backend utilities using the following Node.js commands from the `Backend` directory:

- **Email Utility:**
  ```bash
  node -e 'import { normalizeEmail } from "./utils/email.js"; console.log(normalizeEmail("test@example.com"))'
  ```
- **String Utility:**
  ```bash
  node -e 'import { escapeRegex } from "./utils/strings.js"; console.log(escapeRegex(".*+?"))'
  ```
- **Security Utility:**
  ```bash
  node -e 'import { shouldExposeOtpToClient } from "./utils/security.js"; console.log(shouldExposeOtpToClient())'
  ```

### Port Conflicts
If you see `ECONNREFUSED` or `EADDRINUSE`, ensure no other processes are running on ports `8080` (Backend) and `5173` (Frontend).

```bash
# Kill processes on specific ports
kill $(lsof -t -i :8080) 2>/dev/null
kill $(lsof -t -i :5173) 2>/dev/null
```
