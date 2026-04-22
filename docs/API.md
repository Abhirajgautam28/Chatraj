# ChatRaj API Documentation

## Authentication
Most endpoints require a valid JWT token in the `Authorization` header (`Bearer <token>`) or `token` cookie.

### User Endpoints
- `POST /api/users/register`: Register a new user.
- `POST /api/users/login`: Authenticate a user.
- `POST /api/users/verify-otp`: Verify account or password reset OTP.
- `POST /api/users/send-otp`: Request a new OTP for password reset.
- `GET /api/users/all`: List all users (excluding current).
- `GET /api/users/leaderboard`: Get top users by project count (cached).

### Project Endpoints
- `GET /api/projects/all`: Get all projects for current user.
- `POST /api/projects/create`: Create a new project.
- `PUT /api/projects/add-user`: Add collaborators to a project.
- `GET /api/projects/get-project/:projectId`: Get detailed project info.
- `PUT /api/projects/update-file-tree`: Update the project's file structure.
- `GET /api/projects/settings/:projectId`: Get project-specific settings.
- `PUT /api/projects/settings/:projectId`: Update project-specific settings.
- `GET /api/projects/category-counts`: Get project counts per category.
- `GET /api/projects/showcase`: Get featured projects (cached).

### Blog Endpoints
- `GET /api/blogs`: List all blogs (paginated).
- `GET /api/blogs/:id`: Get a single blog by ID.
- `POST /api/blogs`: Create a new blog.
- `POST /api/blogs/:id/like`: Toggle like on a blog (atomic).
- `POST /api/blogs/:id/comment`: Add a comment to a blog (atomic).

### Contact Endpoints
- `POST /api/contact/submit`: Submit the contact us form.

### AI Endpoints
- `POST /api/ai`: Generate AI response (cached).

## Socket.io Events
### Client to Server
- `project-message`: Send a new message.
- `message-read`: Mark a message as read.
- `message-delivered`: Mark a message as delivered.
- `message-reaction`: Add/remove an emoji reaction.
- `typing`: Notify others that user is typing.
- `stop-typing`: Notify others that user stopped typing.

### Server to Client
- `project-message`: Broadcast a new message.
- `message-read`: Broadcast read status update.
- `message-delivered`: Broadcast delivery status update.
- `message-reaction`: Broadcast reaction update.
- `typing`: Broadcast typing status.
- `stop-typing`: Broadcast stop-typing status.
