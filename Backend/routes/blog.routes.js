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

const likeRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // allow more frequent likes but still protect against abuse
});

const getBlogRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 blog fetch requests per windowMs
});

router.post('/', authUser, createBlog);
router.get('/', getAllBlogs);
router.get('/:id', getBlogRateLimiter, getBlogById);
router.post('/like/:id', authUser, likeRateLimiter, likeBlog);
router.post('/comment/:id', authUser, commentRateLimiter, commentOnBlog);
router.post('/generate', authUser, generateRateLimiter, generateBlogContent);

export default router;
