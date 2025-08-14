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

const router = Router();

router.post('/', authUser, createBlog);
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/like/:id', authUser, likeBlog);
router.post('/comment/:id', authUser, commentOnBlog);
router.post('/generate', authUser, generateBlogContent);

export default router;
