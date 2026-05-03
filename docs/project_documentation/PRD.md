# ChatRaj Product Requirements Document (PRD)

## 1. Product Vision & Scope
**ChatRaj** is a unified, real-time collaborative workspace designed to eliminate developer context-switching. By merging a fully-functional WebContainer IDE, a high-performance chat client, and an omnipresent AI assistant into a single browser tab, ChatRaj aims to be the default operating system for agile development teams.

### 1.1 In-Scope
- Real-time text messaging with read receipts and presence indicators.
- Synchronized multiplayer code editing (Last-Write-Wins concurrency).
- In-browser Node.js execution environments (WebContainers).
- Integrated Google Generative AI for code completion and debugging via `@ChatRaj` mentions.
- Project and file-tree management.

### 1.2 Out-of-Scope (V1 & V2)
- Native WebRTC Audio/Video calling (deferring to Zoom/Meet).
- CRDT-based (Conflict-free Replicated Data Type) offline concurrency resolution.
- Native mobile application development (iOS/Android).
- Compilation of non-JavaScript/WASM languages (e.g., C++, Rust native execution).

---

## 2. User Stories & Acceptance Criteria

### Epic 1: The Multiplayer Workspace
**User Story 1.1:** As a developer, I want to see my teammates typing code in real-time so we can pair program remotely.
- **Acceptance Criteria:**
  - When User A types in the editor, User B sees the updated text within 150ms.
  - The UI displays a "Liquid Cursor" indicating exactly where User A is currently focused.

**User Story 1.2:** As an engineering manager, I want to invite external contractors to a project without requiring them to install local dependencies.
- **Acceptance Criteria:**
  - Inviting a user generates a secure, unique URL.
  - Upon clicking, the contractor's browser downloads the WebContainer and provisions the exact Node.js environment required for the project automatically.

### Epic 2: The Contextual AI Assistant
**User Story 2.1:** As a junior developer, I want to ask the AI to explain a specific block of code currently in my active file.
- **Acceptance Criteria:**
  - User types `@ChatRaj explain the auth block` in the chat.
  - The system automatically appends the contents of the currently active file to the hidden AI prompt.
  - The AI responds in the chat stream with a formatted markdown explanation.

**User Story 2.2:** As a system administrator, I want AI responses to be as fast and cheap as possible.
- **Acceptance Criteria:**
  - Every AI prompt is MD5 hashed.
  - The backend checks Redis for the hash. If an exact prompt was asked within the last 24 hours, the cached response is returned in <50ms, bypassing the Google API.

---

## 3. Technical Requirements

### 3.1 Performance & SLAs
- **WebSocket Latency:** < 100ms globally (P95).
- **WebContainer Boot Time:** < 5 seconds on standard broadband connections.
- **API Availability:** 99.9% uptime.

### 3.2 Security & Compliance
- **Authentication:** All API routes must enforce JWT validation.
- **Rate Limiting:** Protect against DDoS via Redis-backed rate limiters (Global API, Auth, and AI endpoints specifically).
- **Password Storage:** bcrypt hashing with a minimum salt round of 10.
- **XSS Protection:** All markdown rendered in chat or blogs must be strictly sanitized using DOMPurify before React injection.

---

## 4. Telemetry & Success Metrics (KPIs)
To determine product-market fit, the following metrics will be tracked via Vercel Analytics and internal MongoDB aggregations:
1. **Activation Rate:** The percentage of registered users who successfully execute code in a WebContainer within 24 hours.
2. **AI Engagement:** Average AI queries per active user per day.
3. **Collaboration Density:** Average number of unique users active within a single project simultaneously.
4. **Session Length:** Average continuous connection time to the Socket.io server.
