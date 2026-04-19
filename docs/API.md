# 🚀 ChatRaj API Documentation

This document outlines the API endpoints available in the ChatRaj backend.

## 🔐 Authentication
Most endpoints require a valid JWT token passed in the `Authorization` header as a Bearer token or in a `token` cookie.

---

## 👤 User Endpoints

### Register User
`POST /api/users/register`
- **Body:** `{ firstName, lastName, email, password, googleApiKey }`
- **Response:** `201 Created` - OTP sent to email.

### Verify OTP
`POST /api/users/verify-otp`
- **Body:** `{ userId, email, otp }`
- **Response:** `200 OK` - Returns user and token.

### Login
`POST /api/users/login`
- **Body:** `{ email, password }`
- **Response:** `200 OK` - Returns user and token.

---

## 📁 Project Endpoints

### Create Project
`POST /api/projects/create` (Auth required)
- **Body:** `{ name, category, users? }`
- **Response:** `201 Created`

### Update File Tree
`PUT /api/projects/update-file-tree` (Auth required)
- **Body:** `{ projectId, fileTree }`
- **Response:** `200 OK`

---

## 🤖 AI Endpoints

### Get AI Result
`GET /api/ai/get-result`
- **Query:** `?prompt=...`
- **Response:** `200 OK`

---

## 📝 Blog Endpoints

### Create Blog
`POST /api/blogs/create` (Auth required)
- **Body:** `{ title, content }`
- **Response:** `201 Created`

---

## 🔌 Socket.io Events

### Connection
Connect to the root namespace with `token` in `handshake.auth` and `projectId` in `handshake.query`.

### Inbound Events (Client -> Server)
- `project-message`: Sends a message to the project.
    - **Data:** `{ message, sender, parentMessageId?, googleApiKey? }`
- `message-delivered`: Marks a message as delivered.
    - **Data:** `{ messageId, userId }`
- `message-read`: Marks a message as read.
    - **Data:** `{ messageId, userId }`
- `message-reaction`: Adds/removes an emoji reaction.
    - **Data:** `{ messageId, userId, emoji }`
- `typing` / `stop-typing`: Broadcasts typing status.
    - **Data:** `{ userId, projectId }`

### Outbound Events (Server -> Client)
- `project-message`: Broadcasts a new message.
- `message-delivered`: Broadcasts delivery confirmation.
- `message-read`: Broadcasts read confirmation.
- `message-reaction`: Broadcasts updated message reactions.
- `typing` / `stop-typing`: Broadcasts member typing status.
