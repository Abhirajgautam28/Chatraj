import * as blogService from '../services/blog.service.js';
import mongoose from 'mongoose';
import response from '../utils/response.js';

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newBlog = await blogService.createBlog({ title, content, userEmail: req.user.email });
        return response.success(res, newBlog, 'Blog created successfully', 201);
    } catch (err) {
        const status = err.message === 'User not found' ? 401 : 500;
        return response.error(res, err.message, status);
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await blogService.getAllBlogs();
        return response.success(res, blogs);
    } catch (err) {
        return response.error(res, 'Internal server error');
    }
};

export const getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return response.error(res, 'Invalid blog id', 400);
        const blog = await blogService.getBlogById(id);
        if (!blog) {
            return response.error(res, 'Blog not found', 404);
        }
        return response.success(res, blog);
    } catch (err) {
        return response.error(res, 'Internal server error');
    }
};

export const likeBlog = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return response.error(res, 'Invalid blog id', 400);
        const blog = await blogService.likeBlog(id, req.user.email);
        return response.success(res, blog, 'Success');
    } catch (err) {
        const status = err.message === 'Blog not found' ? 404 : (err.message === 'User not found' ? 401 : 500);
        return response.error(res, err.message, status);
    }
};

export const commentOnBlog = async (req, res) => {
    try {
        const { text } = req.body;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return response.error(res, 'Invalid blog id', 400);
        const blog = await blogService.commentOnBlog(id, req.user.email, text);
        return response.success(res, blog, 'Comment added successfully', 201);
    } catch (err) {
        const status = err.message === 'Blog not found' ? 404 : (err.message === 'User not found' ? 401 : 500);
        return response.error(res, err.message, status);
    }
};

export const generateBlogContent = async (req, res) => {
    try {
        const { topic } = req.body;
        const content = await blogService.generateBlogContent(topic);
        return response.success(res, { content });
    } catch (err) {
        const status = err.message === 'Invalid topic' ? 400 : 500;
        return response.error(res, err.message, status);
    }
};
