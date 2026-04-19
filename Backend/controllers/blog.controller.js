import * as blogService from '../services/blog.service.js';
import mongoose from 'mongoose';

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newBlog = await blogService.createBlog({ title, content, userEmail: req.user.email });
        res.status(201).json(newBlog);
    } catch (error) {
        const status = error.message === 'User not found' ? 401 : 500;
        res.status(status).json({ error: error.message || 'Internal server error' });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await blogService.getAllBlogs();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });
        const blog = await blogService.getBlogById(id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const likeBlog = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });
        const blog = await blogService.likeBlog(id, req.user.email);
        res.status(200).json(blog);
    } catch (error) {
        const status = error.message === 'Blog not found' ? 404 : (error.message === 'User not found' ? 401 : 500);
        res.status(status).json({ error: error.message || 'Internal server error' });
    }
};

export const commentOnBlog = async (req, res) => {
    try {
        const { text } = req.body;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });
        const blog = await blogService.commentOnBlog(id, req.user.email, text);
        res.status(201).json(blog);
    } catch (error) {
        const status = error.message === 'Blog not found' ? 404 : (error.message === 'User not found' ? 401 : 500);
        res.status(status).json({ error: error.message || 'Internal server error' });
    }
};

export const generateBlogContent = async (req, res) => {
    try {
        const { topic } = req.body;
        const content = await blogService.generateBlogContent(topic);
        res.status(200).json({ content });
    } catch (error) {
        const status = error.message === 'Invalid topic' ? 400 : 500;
        res.status(status).json({ error: error.message || 'Internal server error' });
    }
};
