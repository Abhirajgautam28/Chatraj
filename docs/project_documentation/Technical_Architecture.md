# ChatRaj Technical Architecture & Infrastructure

## 1. Global System Architecture

The ChatRaj platform utilizes a deeply decoupled client-server architecture, specifically optimized for real-time WebSockets and edge-based code execution.

### 1.1 High-Level Component Interaction (Data Flow)

```text
[ Developer Browser ]
   |-- Executes WebContainers locally (WASM Node.js)
   |-- Renders UI via React 18 / Vite
   |
   | (1. HTTP/REST: Auth, Project Metadata, CRUD)
   | (2. WSS/WebSockets: Keystrokes, Chat, Cursor Positions)
   v
[ Edge CDN / Load Balancer (Nginx / Cloudflare) ]
   |
   |-- (REST Traffic) ----> [ Express.js API Cluster ]
   |                             |-- Validates JWTs
   |                             |-- Interacts with MongoDB
   |
   |-- (WSS Traffic) -----> [ Socket.io Node Cluster ]
                                 |-- Manages Room State
                                 |-- Uses Redis Pub/Sub adapter to sync across nodes
```

---

## 2. Technology Stack & Justification

### 2.1 The Frontend (Client-Side)
- **Framework:** React 18. Chose React for its massive ecosystem and component reusability. Vite is used for tooling due to its ES-module-based HMR, drastically reducing local build times compared to Webpack.
- **State Management:** Native React Context (`UserContext`, `ThemeContext`) and highly specific custom hooks (`useProjectState.js`). Redux was evaluated but rejected to minimize boilerplate, given the heavy reliance on WebSocket event-driven state changes.
- **Code Execution:** `@webcontainer/api`. This allows booting a full Node.js environment *inside the user's browser* using WebAssembly. This shifts the compute cost of code execution from ChatRaj servers to the user's local machine, saving massive infrastructure costs.

### 2.2 The Backend (Server-Side)
- **Runtime & Framework:** Node.js + Express.js. Chosen for its non-blocking I/O, which is critical for handling thousands of concurrent WebSocket connections.
- **Caching & Rate Limiting:** Redis (via `ioredis`). Redis handles session blacklisting, rate limiting (crucial for protecting expensive AI API routes), and prompt caching.
- **Database:** MongoDB Atlas. A NoSQL document store is perfect for the highly flexible, deeply nested JSON structures required to store virtual file trees (`fileTree`).

---

## 3. Core Architectural Workflows

### 3.1 Real-Time Code Synchronization (Concurrency)
Currently, ChatRaj utilizes a **Last-Write-Wins (LWW)** model over WebSockets.
1. User A types a character.
2. The frontend debounces the input (150ms).
3. The frontend emits a `file-update` event containing the absolute path and the full file string.
4. The server receives this and broadcasts it to the specific project room.
5. User B receives the payload and replaces their local state.
*Note: The V2 roadmap includes migrating to CRDTs (Conflict-free Replicated Data Types) via Yjs to handle simultaneous line edits without overwriting.*

### 3.2 The AI Generation Pipeline
1. The Express server intercepts a `@ChatRaj` chat message.
2. The backend constructs a mega-prompt combining the user's message and the current active file's code string.
3. **The Cache Intercept:** The server hashes the prompt using MD5. `redis.get(hash)` is executed. If a result exists, it is instantly returned to the Socket stream.
4. If a cache miss occurs, the server awaits the `@google/generative-ai` API, formats the markdown, saves it to Redis with an 86400 TTL (24 hours), and broadcasts it.

---

## 4. DevOps, CI/CD, and Monitoring

### 4.1 CI/CD Pipeline (GitHub Actions)
- **PR Stage:** On every pull request, GitHub Actions provisions an Ubuntu runner. It runs `npm run test:backend:unit` (Jest) and `npm run test:frontend:unit` (Vitest).
- **E2E Stage:** Cypress tests verify the login and project creation flows.
- **Deploy Stage (Frontend):** Merges to `main` trigger a Vercel deployment automatically.
- **Deploy Stage (Backend):** Merges to `main` trigger a Docker build, push to an elastic container registry, and a rolling update to the Kubernetes cluster.

### 4.2 Telemetry and Monitoring
- **Frontend:** Vercel Analytics tracks Core Web Vitals (LCP, FID, CLS).
- **Backend:** `winston` is used for structured JSON logging. All server errors, rate limit breaches, and cache miss rates are logged to standard output for aggregation by Datadog or ELK stack.

### 4.3 Disaster Recovery
- **Database:** MongoDB Atlas is configured for automated daily snapshots with a 7-day retention policy and Point-in-Time Recovery (PITR) enabled.
- **Redis Loss:** Since Redis is used entirely ephemerally (caching and rate limits), a Redis node crash requires zero data recovery. The system will temporarily experience higher API latency while the cache rebuilds organically.
