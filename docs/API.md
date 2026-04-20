# ChatRaj API Documentation

## Authentication
- POST /api/users/register - Register a new user
- POST /api/users/login - Login and receive JWT
- POST /api/users/verify-otp - Verify account with OTP
- GET /api/users/logout - Invalidate session

## Projects
- GET /api/projects/all - List user's projects
- POST /api/projects/create - Create a new project
- GET /api/projects/get-project/:id - Fetch project details
- PUT /api/projects/update-file-tree - Save project files

## AI
- POST /api/ai - Generate code or text via Google Gemini

## Socket.io Events
- project-message - Real-time chat and file sync
- message-delivered - Delivery confirmation
- message-read - Read receipt
- message-reaction - Emoji reactions
- typing / stop-typing - User presence indicators
