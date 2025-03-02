```markdown
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

## **Frontend Setup**

1. Clone the repository and navigate to the `frontend` folder:

   ```bash
   git clone https://github.com/yourusername/ChatRaj.git
   cd ChatRaj/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend` folder (if required) and ensure it contains the API URL:

   ```properties
   VITE_API_URL=http://localhost:8080
   ```

4. Start the frontend development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) (or whichever port Vite uses).

---

## **Backend Setup**

1. Open a new terminal and navigate to the `Backend` folder:

   ```bash
   cd ChatRaj/Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. **Environment Configuration:**

   **Important:** The `.env` file is excluded from the repository for security reasons. Create a new file named `.env` in the `ChatRaj/Backend` folder with the following template:

   ```properties
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/ChatRaj
   JWT_SECRET=ChatRaj_Secret
   REDIS_HOST=<YOUR_REDIS_HOST>
   REDIS_PORT=<YOUR_REDIS_PORT>
   REDIS_PASSWORD=<YOUR_REDIS_PASSWORD>
   GOOGLE_AI_KEY=<YOUR_GOOGLE_AI_KEY>
   ```

   Replace `<YOUR_REDIS_HOST>`, `<YOUR_REDIS_PORT>`, `<YOUR_REDIS_PASSWORD>`, and `<YOUR_GOOGLE_AI_KEY>` with your actual credentials.

4. **Start the Backend Server:**

   Ensure your `package.json` includes a start script. Example:

   ```json
   "scripts": {
     "dev": "node setupEnv.js",
     "start": "node setupEnv.js",
     "test": "echo \"Error: no test specified\" && exit 1"
   }
   ```

   Then, run:

   ```bash
   npm run dev
   ```

5. **Testing the Backend:**

   - Use a browser or API client (like Postman) to verify the server is running at:
     [http://localhost:8080](http://localhost:8080)
   - Test various endpoints (e.g., user authentication, project creation) as needed.

---

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
