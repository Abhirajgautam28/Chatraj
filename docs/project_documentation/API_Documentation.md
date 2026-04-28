# API & WebSockets Documentation: ChatRaj

## Base URL
`http://localhost:8080/api` (Local Development)

## Authentication
All protected routes require a JSON Web Token (JWT) provided in the Authorization header.
`Authorization: Bearer <token>`

---

## 1. REST API Endpoints

### 1.1 User & Authentication Routes (`/api/users`)
* **POST `/register`**: Register a new user. Requires `email`, `password`.
* **POST `/login`**: Authenticate a user and receive a JWT.
* **GET `/profile`**: (Protected) Get the current authenticated user's profile.
* **POST `/logout`**: (Protected) Invalidate the current session token.

### 1.2 Project Routes (`/api/projects`)
* **POST `/create`**: (Protected) Create a new workspace project. Requires `name`.
* **GET `/all`**: (Protected) Retrieve all projects associated with the current user.
* **POST `/add-user`**: (Protected) Add a collaborator to a specific project. Requires `projectId`, `userId`.
* **GET `/get-project/:projectId`**: (Protected) Fetch details, file tree, and active users for a specific project.

### 1.3 AI Routes (`/api/ai`)
* **GET `/get-result`**: (Protected) Generate a response from the AI.
  * **Query Params:** `prompt` (String) - The user's query or code snippet.
  * **Response:** JSON containing the AI's generated text/code. Caching is applied via Redis.

### 1.4 Blog Routes (`/api/blogs`)
* **POST `/create`**: (Protected) Publish a new blog post.
* **GET `/all`**: Retrieve a paginated list of all published blogs.
* **GET `/:id`**: Fetch a specific blog post by ID.
* **POST `/:id/like`**: (Protected) Toggle a like on a blog post.
* **POST `/:id/comment`**: (Protected) Add a comment to a blog post.

### 1.5 Newsletter Routes (`/api/newsletter`)
* **POST `/subscribe`**: Subscribe an email address to the ChatRaj newsletter.

---

## 2. WebSocket Events (Socket.io)

### Connection
Clients connect to the Socket.io server and must emit a `join-project` event to participate in a specific workspace room.

### 2.1 Client-to-Server Events (Emitted by Frontend)
* **`join-project`**: Join a specific project's Socket room.
  * Payload: `{ projectId: String }`
* **`project-message`**: Send a chat message to the project room.
  * Payload: `{ message: String, sender: Object }`
* **`file-update`**: Broadcast a change in the code editor.
  * Payload: `{ path: String, content: String }`
* **`cursor-move`**: Broadcast user cursor coordinates for the live multiplayer UI.
  * Payload: `{ x: Number, y: Number, user: Object }`

### 2.2 Server-to-Client Events (Listened by Frontend)
* **`project-message`**: Receive a new message from a collaborator or the AI.
* **`file-update`**: Receive code editor changes from a collaborator.
* **`user-joined`**: Notification that a new collaborator has connected to the project.
* **`user-left`**: Notification that a collaborator has disconnected.
* **`cursor-update`**: Receive real-time coordinates of collaborators' cursors to render Liquid Cursors.

---

## 3. Rate Limiting
To ensure platform stability, all API routes are protected by Redis-backed rate limiters (located in `Backend/middleware/rateLimiter.js`).
* **Global API Limit:** 100 requests per 15 minutes per IP.
* **AI API Limit:** 20 requests per 15 minutes per IP.
* **Auth Limit:** 5 failed login attempts per 15 minutes per IP.