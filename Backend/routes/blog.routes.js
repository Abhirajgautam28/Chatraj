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

const createBlogRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 blog creation requests per windowMs
});

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

const getAllBlogsRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 list-all requests per windowMs
});

router.post('/', createBlogRateLimiter, authUser, createBlog);
router.get('/', getAllBlogsRateLimiter, getAllBlogs);
router.get('/:id', getBlogRateLimiter, getBlogById);
router.post('/like/:id', likeRateLimiter, authUser, likeBlog);
router.post('/comment/:id', commentRateLimiter, authUser, commentOnBlog);
router.post('/generate', generateRateLimiter, authUser, generateBlogContent);

export default router;
