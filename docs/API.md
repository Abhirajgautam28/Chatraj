# 📖 ChatRaj API Documentation

This document outlines the standardized response format and the main API endpoints for the ChatRaj project.

## 📐 Response Structure

All API responses follow a consistent format to simplify client-side processing.

### ✅ Success Response
```json
{
  "success": true,
  "message": "Human-readable status message",
  "data": { ... payload ... }
}
```

### ❌ Error Response
```json
{
  "success": false,
  "error": "Error title or summary",
  "details": {
    "code": "ERROR_CODE",
    "details": "Environment-aware technical details or validation array"
  }
}
```

---

## 🔐 Authentication

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/users/register` | `POST` | Register a new user and sends verification OTP. |
| `/api/users/login` | `POST` | Authenticate user and return JWT + User data. |
| `/api/users/verify-otp`| `POST` | Verify registration or password reset OTP. |
| `/api/users/profile` | `GET` | Retrieve the authenticated user's profile. |
| `/api/users/logout` | `GET` | Blacklist the current token and logout. |

---

## 🚀 Projects

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/projects/create` | `POST` | Create a new collaborative project. |
| `/api/projects/all` | `GET` | Fetch all projects for the authenticated user. |
| `/api/projects/get-project/:projectId` | `GET` | Retrieve project details and file tree. |
| `/api/projects/update-file-tree` | `PUT` | Update the project's virtual file system. |
| `/api/projects/add-user` | `PUT` | Invite collaborators to a project. |

---

## 📝 Blogs

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/blogs` | `GET` | List all community blog posts. |
| `/api/blogs` | `POST` | Publish a new blog post. |
| `/api/blogs/:id` | `GET` | Retrieve a single blog with comments. |
| `/api/blogs/like/:id` | `PUT` | Toggle like status on a blog post. |
| `/api/blogs/comment/:id`| `PUT` | Add a comment to a blog post. |

---

## 🛡️ Security Measures

1.  **JWT Authentication**: Required for all `/api/` endpoints except login/register.
2.  **CSRF Protection**: Synchronizer Token Pattern + Signed Stateless Fallback.
3.  **Rate Limiting**: Applied to auth and sensitive routes to prevent brute-force.
4.  **NoSQL Injection Protection**: Recursive key validation for nested JSON updates.
