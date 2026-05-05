# Software Requirements Specification (SRS) for ChatRaj

## 1. Introduction

### 1.1 Purpose
This document provides a complete Software Requirements Specification (SRS) for the ChatRaj platform. It details the functional and non-functional requirements to guide the engineering team, QA, and stakeholders.

### 1.2 Document Conventions
This document adheres to IEEE standard 830-1998 formatting structures.
- **FR:** Functional Requirement
- **NFR:** Non-Functional Requirement
- Priority Levels: High, Medium, Low.

### 1.3 Intended Audience
Backend engineers, frontend engineers, DevOps, QA automation testers, and product managers.

---

## 2. Overall Description

### 2.1 Product Perspective
ChatRaj is an independent, cloud-based web application. It interfaces with third-party APIs (Google Generative AI) for processing and utilizes standard SMTP servers (Gmail) for transactional emails.

### 2.2 User Classes and Characteristics
1. **Unregistered User:** Can view the marketing homepage, read public blogs, and submit contact forms.
2. **Standard User (Registered):** Can create projects, invite collaborators, use the WebContainer IDE, and chat in real-time.
3. **System Administrator:** Can manage global platform settings, view audit logs, and override rate limits (future scope).

### 2.3 Operating Environment
- **Client Side:** Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). Must support WebAssembly (WASM) for WebContainers to function.
- **Server Side:** Node.js v18+, Redis v6+, MongoDB v5+.

---

## 3. Specific Requirements

### 3.1 Functional Requirements (FR)

#### FR-1: Authentication & Authorization
- **FR-1.1:** The system shall allow users to register using a valid email and a password of at least 8 characters.
- **FR-1.2:** The system shall encrypt passwords using bcrypt before database insertion.
- **FR-1.3:** The system shall issue a JWT upon successful login, valid for 24 hours.
- **FR-1.4:** The system shall invalidate the JWT upon explicit user logout by placing the token in a Redis blacklist.

#### FR-2: Project Management
- **FR-2.1:** The system shall allow a registered user to create a workspace project.
- **FR-2.2:** The system shall maintain a virtual file tree (`fileTree`) associated with the project in the database.
- **FR-2.3:** The system shall allow the project owner to generate a secure invitation mechanism to add other registered users to the project.

#### FR-3: Real-Time Collaborative Workspace
- **FR-3.1:** The system shall establish a WebSocket connection when a user opens a project.
- **FR-3.2:** The system shall broadcast text messages to all users currently connected to the specific project room.
- **FR-3.3:** The system shall broadcast code file modifications to all users connected to the project room with a maximum debounce delay of 150ms.
- **FR-3.4:** The system shall mount the current `fileTree` into a local browser WebContainer upon the user clicking the "Run" button.

#### FR-4: AI Integration
- **FR-4.1:** The system shall intercept any chat message containing the string `@ChatRaj`.
- **FR-4.2:** The system shall extract the context of the user's current file and append it to the AI prompt invisibly.
- **FR-4.3:** The system shall parse the AI's response and render markdown and syntax-highlighted code blocks in the chat interface.

#### FR-5: Content Management (Blogs)
- **FR-5.1:** The system shall allow users to create, view, like, and comment on markdown-based blog posts.

### 3.2 Non-Functional Requirements (NFR)

#### NFR-1: Performance
- **NFR-1.1:** The REST API must respond to 95% of non-AI requests within 200ms.
- **NFR-1.2:** WebContainer boot time must not exceed 5 seconds on a standard 50Mbps internet connection.
- **NFR-1.3:** AI prompts that result in a Redis cache hit must be returned to the client within 50ms.

#### NFR-2: Security
- **NFR-2.1:** All data transmission must occur over HTTPS/WSS (TLS 1.2 or higher).
- **NFR-2.2:** The system must implement rate limiting: maximum 100 requests per 15 minutes per IP for general APIs, and 5 failed logins per 15 minutes.
- **NFR-2.3:** All user-generated text inputs (chat, blogs) must be sanitized to prevent Cross-Site Scripting (XSS) attacks.

#### NFR-3: Reliability & Availability
- **NFR-3.1:** The platform must guarantee an uptime of 99.9% (excluding scheduled maintenance).
- **NFR-3.2:** The database must undergo automated backups every 24 hours.

#### NFR-4: Maintainability
- **NFR-4.1:** The codebase must maintain a minimum of 80% test coverage across backend utility and service modules.
- **NFR-4.2:** All code must conform to the project's ESLint and Prettier configurations.