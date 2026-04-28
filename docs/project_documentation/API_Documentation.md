# ChatRaj API & WebSockets Documentation

## 1. Overview
This document provides a comprehensive, highly detailed specification of the ChatRaj RESTful API and WebSocket event systems. It is intended for integration engineers, QA automation specialists, and core developers.

### 1.1 Base Specifications
- **Base URL:** `https://api.chatraj.com/api` (Production) / `http://localhost:8080/api` (Local)
- **Protocol:** HTTPS / WSS
- **Data Format:** JSON (application/json)
- **Rate Limiting:** IP-based via Redis (Global: 100 req/15min, AI: 20 req/15min, Auth: 5 failures/15min)

### 1.2 Authentication Standards
All protected routes require a JSON Web Token (JWT).
- **Header Format:** `Authorization: Bearer <token>`
- **Token Expiry:** 24 Hours
- **Validation Failure Response:** `401 Unauthorized` with body `{ "error": "Invalid or expired token" }`

---

## 2. RESTful Endpoints

### 2.1 User & Authentication (`/api/users`)

#### 2.1.1 POST `/register`
Registers a new user in the system. Triggers an async email verification flow.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "user": {
      "_id": "60d5ecb8b392...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```
- **Error Codes:** `400 Bad Request` (Validation Failed), `409 Conflict` (Email exists).

#### 2.1.2 POST `/login`
Authenticates a user and issues a JWT.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):** Same schema as `/register`.
- **Error Codes:** `401 Unauthorized` (Invalid credentials), `429 Too Many Requests` (Rate limited).

#### 2.1.3 GET `/profile`
Retrieves the authenticated user's complete profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** User object without sensitive password data.

#### 2.1.4 POST `/logout`
Invalidates the current session token by appending it to the Redis blacklist.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** `{ "message": "Logged out successfully" }`

---

### 2.2 Project Management (`/api/projects`)

#### 2.2.1 POST `/create`
Provisions a new collaborative workspace.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "Frontend Refactor",
    "category": "react",
    "visibility": "private"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "project": {
      "_id": "5f8a...",
      "name": "Frontend Refactor",
      "users": ["60d5ecb8b392..."],
      "fileTree": {},
      "createdAt": "2023-10-15T12:00:00Z"
    }
  }
  ```

#### 2.2.2 GET `/all`
Retrieves a list of all projects the authenticated user has access to.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** `{ "projects": [ { Project Object } ] }`

#### 2.2.3 POST `/add-user`
Adds a collaborator to a specific project.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "projectId": "5f8a...",
    "userId": "60d5ecb8b392..."
  }
  ```

#### 2.2.4 GET `/get-project/:projectId`
Fetches deeply populated details for a specific project.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Populates `users` array with email, firstName, and lastName. Returns current `fileTree`.

---

### 2.3 Artificial Intelligence (`/api/ai`)

#### 2.3.1 GET `/get-result`
Generates a response from the Google Generative AI model, utilizing Redis caching.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `prompt` (String) - The user's query.
- **Response (200 OK):**
  ```json
  {
    "result": "Here is the refactored code:\n\n```javascript\nconsole.log('optimized');\n```"
  }
  ```
- **Error Codes:** `500 Internal Server Error` (AI service unreachable), `429 Too Many Requests`.

---

### 2.4 Blogs & Community (`/api/blogs`)

#### 2.4.1 POST `/create`
Publishes a new markdown-based blog post.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{ "title": "System Design", "content": "# Architecture..." }`

#### 2.4.2 GET `/all`
Retrieves a paginated list of published blogs.
- **Query Params:** `page` (Int), `limit` (Int).

#### 2.4.3 POST `/:id/like`
Toggles a like on a blog post using MongoDB `$addToSet` or `$pull` operators.
- **Headers:** `Authorization: Bearer <token>`

---

## 3. WebSocket Event Specifications (Socket.io)

### 3.1 Connection Handshake
Clients must connect to the `/` namespace and provide their JWT token in the authentication payload if necessary for initial handshake.

### 3.2 Client-to-Server Events

#### 3.2.1 `join-project`
Subscribes the socket connection to a specific Redis/Socket.io room for localized broadcasting.
- **Payload:** `{ "projectId": "string" }`

#### 3.2.2 `project-message`
Emits a chat message to the room. If the message includes `@ChatRaj`, the server will autonomously intercept, call the AI service, and emit the response back.
- **Payload:**
  ```json
  {
    "message": "Can someone review main.js?",
    "sender": {
      "_id": "string",
      "email": "string"
    }
  }
  ```

#### 3.2.3 `file-update`
Transmits code editor changes. Clients must debounce this event to prevent flooding.
- **Payload:**
  ```json
  {
    "path": "/src/main.js",
    "content": "const x = 10;"
  }
  ```

#### 3.2.4 `cursor-move`
Transmits local mouse coordinates to render live Liquid Cursors on peer screens.
- **Payload:** `{ "x": 450, "y": 320, "user": { "firstName": "John" } }`

### 3.3 Server-to-Client Events

#### 3.3.1 `project-message`
Broadcasts incoming messages to all peers in the room.

#### 3.3.2 `file-update`
Updates local peer file states. The frontend uses a Last-Write-Wins strategy.

#### 3.3.3 `user-joined` / `user-left`
Notifies the room of presence changes. Triggers frontend toast notifications.
