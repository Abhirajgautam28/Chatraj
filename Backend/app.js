import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import setupRoutes from './routes/setup.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const allowedOrigins = [
  'https://chatraj-frontend.vercel.app',
  'https://chatraj.vercel.app',
  'http://localhost:5173'
];

connect().catch(console.error);

const app = express();

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.use('/setup', setupRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use("/ai", aiRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

export default app;
