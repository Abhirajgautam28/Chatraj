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
import {
    createBlogLimiter,
    listBlogsLimiter,
    getBlogLimiter,
    likeLimiter,
    commentLimiter,
    generateLimiter
} from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', createBlogLimiter, authUser, createBlog);
router.get('/', listBlogsLimiter, getAllBlogs);
router.get('/:id', getBlogLimiter, getBlogById);
router.post('/like/:id', likeLimiter, authUser, likeBlog);
router.post('/comment/:id', commentLimiter, authUser, commentOnBlog);
router.post('/generate', generateLimiter, authUser, generateBlogContent);

export default router;
