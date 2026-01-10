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
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const rateLimit = require('express-rate-limit');

const router = Router();

const generateContentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 generate requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

router.post('/', authUser, createBlog);
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/like/:id', authUser, likeBlog);
router.post('/comment/:id', authUser, commentOnBlog);
router.post('/generate', generateContentLimiter, authUser, generateBlogContent);

export default router;
