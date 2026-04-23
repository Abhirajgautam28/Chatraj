import Blog from '../models/blog.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { successResponse, errorResponse } from '../utils/response.utils.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newBlog = await Blog.create({ title, content, author: req.user._id });
        return successResponse(res, newBlog, 'Blog created', 201);
    } catch (error) {
        logger.error('createBlog error:', error);
        return errorResponse(res, 'Internal server error');
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            Blog.find().populate('author', 'firstName lastName').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Blog.countDocuments()
        ]);

        return successResponse(res, {
            blogs,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        logger.error('getAllBlogs error:', error);
        return errorResponse(res, 'Internal server error');
    }
};

export const getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return errorResponse(res, 'Invalid ID', 400);
        const blog = await Blog.findById(id).populate('author', 'firstName lastName').populate('comments.user', 'firstName lastName').lean();
        if (!blog) return errorResponse(res, 'Blog not found', 404);
        return successResponse(res, blog);
    } catch (error) {
        logger.error('getBlogById error:', error);
        return errorResponse(res, 'Internal server error');
    }
};

export const likeBlog = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(id)) return errorResponse(res, 'Invalid ID', 400);

        let blog = await Blog.findOneAndUpdate({ _id: id, likes: userId }, { $pull: { likes: userId } }, { new: true });
        if (!blog) blog = await Blog.findOneAndUpdate({ _id: id }, { $addToSet: { likes: userId } }, { new: true });
        if (!blog) return errorResponse(res, 'Blog not found', 404);

        return successResponse(res, blog);
    } catch (error) {
        logger.error('likeBlog error:', error);
        return errorResponse(res, 'Internal server error');
    }
};

export const commentOnBlog = async (req, res) => {
    try {
        const { text } = req.body;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return errorResponse(res, 'Invalid ID', 400);

        const blog = await Blog.findByIdAndUpdate(id, { $push: { comments: { user: req.user._id, text } } }, { new: true }).populate('comments.user', 'firstName lastName');
        if (!blog) return errorResponse(res, 'Blog not found', 404);

        return successResponse(res, blog, 'Comment added', 201);
    } catch (error) {
        logger.error('commentOnBlog error:', error);
        return errorResponse(res, 'Internal server error');
    }
};

export const generateBlogContent = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) return errorResponse(res, 'Topic required', 400);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(`Blog post on: ${topic}`);
        return successResponse(res, { content: result.response.text() });
    } catch (error) {
        return errorResponse(res, 'Internal server error');
    }
};
