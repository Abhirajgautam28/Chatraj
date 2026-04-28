# Technical Architecture Document: ChatRaj

## 1. System Overview
ChatRaj is built on a modern JavaScript-based stack (MERN + Redis + WebSockets), ensuring high performance, scalability, and seamless real-time interactions for users globally.

## 2. High-Level Architecture Diagram
```text
[Client Browsers]
      | (HTTP/REST & WebSockets)
      v
[Load Balancer / Nginx]
      |
      +-----> [Frontend (React / Vite)] (Served via CDN or static hosting)
      |
      +-----> [Backend API (Node.js / Express)]
                    |
                    +---> [Socket.io Server] (Real-time events: Chat, Code Sync)
                    |
                    +---> [Google Generative AI] (External API for AI Assistant)
                    |
                    +---> [Redis Cache] (Session management, Rate Limiting, AI Caching)
                    |
                    +---> [MongoDB Atlas] (Primary Database: Users, Projects, Messages, Blogs)
```

## 3. Technology Stack

### 3.1 Frontend
* **Framework:** React 18 built with Vite for optimal HMR and build performance.
* **Styling:** Tailwind CSS, Animate.css, with complex UI layouts handled via custom theming (e.g., Claymorphism, Glassmorphism).
* **State Management:** React Context API and custom hooks (`useProjectState`).
* **Real-time Communication:** Socket.io-client.
* **Code Editor:** Integrated WebContainers and custom Vim-compatible editors using highlight.js.
* **3D & Animations:** Three.js, GSAP, Motion.js.

### 3.2 Backend
* **Runtime:** Node.js.
* **Framework:** Express.js.
* **Real-time Server:** Socket.io (handling namespaces and rooms per project).
* **AI Integration:** `@google/generative-ai` SDK.
* **Authentication:** JSON Web Tokens (JWT), bcrypt for password hashing.
* **Email Service:** Nodemailer using Gmail SMTP.

### 3.3 Data Layer
* **Primary Database:** MongoDB (hosted on Atlas) using Mongoose ODM.
* **Caching Layer:** Redis. Used for:
  * Prompt caching (MD5 hashing AI queries).
  * Rate limiting middleware.
  * Session and OTP storage.

### 3.4 Infrastructure & Deployment
* **Hosting (Frontend):** Vercel (includes Vercel Analytics).
* **Hosting (Backend):** Containerized via Docker or deployed on platforms like Render/Heroku/AWS EC2.
* **CI/CD:** GitHub Actions running unit/integration tests (Jest for backend, Vitest for frontend) and E2E testing (Cypress).

## 4. Key Workflows & Data Models

### 4.1 Real-Time Code Synchronization
* **Mechanism:** When a user types in the code editor, the frontend emits a `code-update` event via Socket.io to the backend.
* **Broadcasting:** The backend identifies the specific project "room" and broadcasts the update to all other connected clients in that room, updating their UI state instantly.
* **Conflict Resolution:** Last-write-wins (currently), with future roadmap plans for CRDTs (Conflict-free Replicated Data Types).

### 4.2 AI Assistant Workflow
* **Trigger:** A message containing `@ChatRaj` is sent in the chat.
* **Processing:** The frontend parses the mention and triggers an API call to the `/ai/generate` endpoint.
* **Context Assembly:** The backend gathers the current project context (files, recent messages) and constructs a structured prompt.
* **Caching:** The backend checks Redis for a cached response based on the prompt hash. If missing, it queries the Google AI API.
* **Delivery:** The AI response is streamed or returned as JSON, parsed, and broadcasted back to the chat room.

## 5. Security Architecture
* **Authentication:** All secure endpoints require a valid JWT passed in the `Authorization` header.
* **Rate Limiting:** IP-based rate limiting implemented via Redis and centralized in `rateLimiter.js` to prevent brute-force and DDoS attacks.
* **Data Validation:** Mongoose schemas enforce data integrity at the database level.
* **CORS & CSRF:** Strict CORS policies ensure the backend only accepts requests from the designated frontend domain.

## 6. Scalability Strategy
* **Stateless Backend:** The Node.js API is stateless. User sessions and rate limits are stored in Redis, allowing horizontal scaling of the backend servers behind a load balancer.
* **Socket Clustering:** Socket.io instances use Redis adapters to sync events across multiple Node.js worker nodes.
* **Database Sharding:** MongoDB Atlas provides automated scaling and sharding capabilities as data volume grows.