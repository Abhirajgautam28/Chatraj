# Testing Strategy

## Overview
ChatRaj focuses on unit testing for core utilities and services, and integration testing for complex flows.

## Backend Testing
- **Tool**: Jest.
- **Run**: `npm test` in `Backend/`.
- **Mocks**: Mongoose models and Socket.io are mocked in unit tests.
- **Coverage**: Priorities are `auth.middleware`, `project.service`, and `email.utils`.

## Frontend Testing
- **Tool**: Vitest.
- **Run**: `npm test` in `frontend/`.
- **Patterns**: Component testing for reusable UI and hook testing for custom logic.
- **Snapshots**: Used for stable UI components.

## Verification
Before every PR, ensure:
1. `node --check` passes on all modified backend files.
2. The frontend build (`npm run build`) completes without errors.
3. Critical paths (Login, Register, Create Project, Chat) are manually verified.
