import { Router } from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    likeBlog,
    commentOnBlog,
    generateBlogContent
} from '../controllers/blog.controller.js';
import { authUser } from '../middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const commentRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 comment requests per windowMs
});

const generateRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // stricter limit for potentially expensive content generation
});

router.post('/', authUser, createBlog);
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/like/:id', authUser, likeBlog);
router.post('/comment/:id', authUser, commentRateLimiter, commentOnBlog);
router.post('/generate', authUser, generateRateLimiter, generateBlogContent);

export default router;
