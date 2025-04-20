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

### **AI Integration**
- Google Generative AI (`@google/generative-ai`)

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (or yarn)
- A running MongoDB instance (local or cloud)
- Access to a Redis server (local or cloud)
- A valid Google AI Key

---

## Enhanced Features

### Real-time Collaboration
- **Live Chat System** with typing indicators and message reactions
- **Multi-user Code Editing** with real-time updates
- **Project Categories** for better organization
- **File Tree Visualization** with syntax highlighting
- **Code Execution Environment** using WebContainers
- **User Presence Indicators** showing active collaborators

### User Experience
- **Dark/Light Mode Toggle** for comfortable coding
- **Animated Transitions** using Animate.css
- **Responsive Design** for all screen sizes
- **Message Threading** with reply functionality
- **Emoji Reactions** to messages
- **File Icons** based on file types
- **Avatar Generation** for users

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

## **Contributing**

Contributions are welcome! Please follow these steps:

1. **Fork the Repository:** Create a new branch from `main`.
2. **Implement Changes:** Fix bugs or add features while ensuring code consistency.
3. **Test Your Changes:** Ensure both frontend and backend work as expected.
4. **Create a Pull Request:** Provide a detailed description of your changes.

---

## **Future Enhancements**
- **AI Model Training:** Train the model for specific tasks as defined in the categories module.
- **Feature Enhancements:** Improve collaboration, debugging, and AI-assisted coding.
- **Bug Fixes and Improvements:** Continuous refinements based on user feedback.

---

## **License**
This project is licensed under the **MIT License**.

---

Feel free to raise issues or suggest improvements.
Happy Coding!!
