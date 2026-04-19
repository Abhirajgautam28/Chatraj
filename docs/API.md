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
