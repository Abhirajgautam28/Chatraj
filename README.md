# ChatRaj – AI-Powered Software Engineering Collaboration Platform

ChatRaj is an AI-powered platform designed to streamline software engineering tasks by combining intelligent code assistance, real-time collaboration, and project management in one cohesive environment. Built on the MERN stack with real-time capabilities, ChatRaj aims to assist development teams by automating and enhancing various software engineering tasks. Future improvements include training models on specific tasks defined in a categories module.

## Tech Stack

### **Backend**
- Node.js, Express
- MongoDB & Mongoose
- Redis (for caching and token management)
- JWT for authentication
- Socket.io for real-time communication
- dotenv for environment variables

### **Frontend**
- React with Vite
- Tailwind CSS & Animate.css for styling and animations
- Remix Icon for icons
- Motion.js for smooth animations

### **AI Integration**
- Google Generative AI (`@google/generative-ai`)
- Speech Recognition API
- Text-to-Speech capabilities
---

## Enhanced Features

### Real-time Collaboration
- **Live Chat System** with typing indicators and message reactions
- **Multi-user Code Editing** with real-time updates
- **Project Categories** for better organization
- **File Tree Visualization** with syntax highlighting
- **Code Execution Environment** using WebContainers
- **User Presence Indicators** showing active collaborators
- **Voice Input Support** with real-time speech recognition

### User Experience
- **Dark/Light Mode Toggle** for comfortable coding
- **Animated Transitions** using Animate.css
- **Responsive Design** for all screen sizes
- **Message Threading** with reply functionality
- **Emoji Reactions** to messages
- **File Icons** based on file types
- **Avatar Generation** for users
- **Multilingual Support** with 6+ languages:
  - English (US)
  - Hindi (हिंदी)
  - Spanish (Español)
  - French (Français)
  - German (Deutsch)
  - Japanese (日本語)
- **Customizable Chat Interface**:
  - Adjustable message bubble roundness
  - Customizable theme colors
  - Message shadows toggle
  - Font size options
- **Auto-complete Suggestions** for common phrases
- **Adjustable Sidebar** with auto-expand functionality
- **Timestamp Display** with date and time format (DD/MM/YYYY HH:MM)
- **Enhanced Navigation System**:
  - Smart navbar hiding on scroll
  - Smooth transition animations
  - Responsive header adaptations
- **Improved Loading Screens**:
  - Sequential loading indicators
  - Progressive status updates
  - Smooth transitions between states
- **Advanced Animation System**:
  - Coordinated dot animations
  - Color-synchronized interface elements
  - Theme-aware visual feedback
- **Voice Input Enhancements**:
  - Real-time voice status indicators
  - Theme-matched animation colors
  - Improved feedback system

### Privacy Features
- **Local Chat History Management**
  - Toggle to save/clear chat history
  - Automatic message cleanup
  - Manual history clearing option
- **Auto-delete System**
  - Configurable deletion intervals (7/30/90 days)
  - Automatic cleanup of old messages
  - Timestamp tracking with date and time
- **Data Control Options**
  - Local storage management
  - Privacy-focused settings
  - User data protection

### Settings Management
- **Display Settings**
  - Theme customization
  - Chat bubble appearance
  - Font size control
  - Dark/Light mode toggle
- **Behavior Settings**
  - Auto-complete configuration
  - Message sending preferences
  - Scroll behavior options
- **Accessibility Options**
  - Language selection
  - Speech recognition
  - Text-to-speech support
- **Sidebar Preferences**
  - Width adjustment (220px/260px/300px)
  - Auto-expand options
  - User info display
- **Privacy Controls**
  - History management
  - Auto-delete configuration
  - Data retention settings
- **Theme Integration**:
  - Dynamic color system
  - Real-time color previews
  - Synchronized component colors
- **Animation Controls**:
  - Custom timing configurations
  - Sequential animation patterns
  - Performance optimizations

### Project Management
- **Category-based Organization** with 15+ predefined categories
- **Project Collaboration** with invite system
- **File System Management** with real-time updates
- **Role-based Access Control**

### Development Features
- **AI Code Assistant** (@Chatraj mentions)
- **Code Execution** in isolated environments
- **Syntax Highlighting** for multiple languages
- **Project Templates** for quick start
- **Real-time Error Detection**
- **Enhanced UI Components**:
  - Coordinated animation systems
  - Theme-aware visual elements
  - Progressive loading patterns
- **Performance Optimizations**:
  - Efficient animation handling
  - Smooth state transitions
  - Reduced render cycles

---

## Comprehensive Setup Guide

### Prerequisites Installation

#### Windows
1. **Node.js & npm**
   - Download from [Node.js Official Website](https://nodejs.org/)
   - Run the installer and follow the wizard
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **MongoDB**
   - Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Install MongoDB Compass (GUI) during setup
   - Add MongoDB to system PATH
   - Start MongoDB service:
     ```bash
     net start MongoDB
     ```

3. **Redis**
   - Install [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install)
   - Open WSL terminal:
     ```bash
     wsl
     sudo apt-get update
     sudo apt-get install redis-server
     sudo service redis-server start
     ```

#### macOS
1. **Install Homebrew**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Required Software**
   ```bash
   brew install node
   brew install mongodb-community
   brew install redis
   ```

3. **Start Services**
   ```bash
   brew services start mongodb-community
   brew services start redis
   ```

#### Linux (Ubuntu/Debian)
1. **Node.js & npm**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **MongoDB**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   ```

3. **Redis**
   ```bash
   sudo apt-get install redis-server
   sudo systemctl start redis-server
   ```

---

### Project Setup

#### 1. Clone and Configure
```bash
# Clone repository
git clone https://github.com/yourusername/ChatRaj.git
cd ChatRaj

# Create necessary .env files
touch Backend/.env frontend/.env
```

#### 2. Backend Configuration
Edit `Backend/.env`:
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/ChatRaj
JWT_SECRET=your_secure_secret_key
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
GOOGLE_AI_KEY=your_google_ai_key  # Get from https://makersuite.google.com/app/apikey
```

#### 3. Frontend Configuration
Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080
```

#### 4. Install Dependencies
```bash
# Backend setup
cd Backend
npm install

# Frontend setup
cd ../frontend
npm install
```

---

### Running the Application

#### Development Mode
1. **Start Backend**
   ```bash
   # In Backend directory
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   # In frontend directory
   npm run dev
   ```

3. **Access the Application**
   - Open browser: [http://localhost:5173](http://localhost:5173)
   - Register a new account or login

---

### Socket.io & Real-time Backend Setup

> **New:** The backend now uses a dedicated `server.js` file for real-time features with Socket.io.

#### 1. `server.js` Setup (Backend)
- Ensure you have a `Backend/server.js` file with the following structure:

```js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import setupRoutes from "./routes/setup.routes.js";
import connectDB from "./db/db.js";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict this to your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API routes
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);
app.use("/setup", setupRoutes);

// Socket.io events
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Example: join a project room
  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  // Example: handle chat message
  socket.on("chatMessage", ({ projectId, message }) => {
    io.to(projectId).emit("chatMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

- **Do not put this code in `app.js`.**  
  `app.js` should only define and export the Express app.

#### 2. Start the Backend Server
- In the `Backend` directory, run:
  ```bash
  node server.js
  ```
  or (if using nodemon):
  ```bash
  nodemon server.js
  ```

- Make sure you see `Server is running on port 8080` in your terminal.

#### 3. Frontend Socket Configuration
- Ensure your frontend socket connection URL matches your backend (e.g., `http://localhost:8080`).

---

### Common Issues & Troubleshooting

See our detailed [Troubleshooting Guide](./troubleshooting.md) for solutions to common issues.

#### Quick Fixes
1. **Port Already in Use**
   ```bash
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -i :8080
   kill -9 <PID>
   ```

2. **MongoDB Connection Issues**
   - Check if MongoDB is running:
     ```bash
     # Windows
     net start MongoDB

     # Mac
     brew services list

     # Linux
     sudo systemctl status mongod
     ```

3. **Redis Connection Issues**
   - Verify Redis server status:
     ```bash
     # Windows (WSL)
     sudo service redis-server status

     # Mac
     brew services list

     # Linux
     sudo systemctl status redis-server
     ```

---

## **Contributing**

Contributions are welcome! Please follow these steps:

1. **Fork the Repository:** Create a new branch from `main`.
2. **Implement Changes:** Fix bugs or add features while ensuring code consistency.
3. **Test Your Changes:** Ensure both frontend and backend work as expected.
4. **Create a Pull Request:** Provide a detailed description of your changes.

---

## **Future Enhancements**
- **AI Model Training:** Train the model for specific tasks as defined in the categories module
- **Feature Enhancements:** Improve collaboration, debugging, and AI-assisted coding
- **Bug Fixes and Improvements:** Continuous refinements based on user feedback
- **Additional Language Support:** Expand multilingual capabilities
- **Enhanced Privacy Features:** Advanced data protection options
- **Improved Auto-complete:** Context-aware suggestions
- **Animation System Improvements:**
  - Advanced sequential animations
  - Custom timing patterns
  - Performance-focused implementations
- **Theme System Enhancements:**
  - Dynamic color propagation
  - Real-time theme switching
  - Component-level theming

---

## **License**
This project is licensed under the **MIT License**.

---

Feel free to raise issues or suggest improvements.
Happy Coding! 🚀
