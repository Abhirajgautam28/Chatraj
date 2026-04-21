import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import { generateContent } from '../services/ai.service.js';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        const newBlog = new Blog({
            title,
            content,
            author: req.user._id
        });

        await newBlog.save();
        sendSuccess(res, 201, { blog: newBlog }, 'Blog created successfully');
    } catch (error) {
        logger.error('createBlog error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'firstName lastName').sort({ createdAt: -1 }).lean();
        sendSuccess(res, 200, { blogs });
    } catch (error) {
        logger.error('getAllBlogs error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

export const getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid blog id');
        const blog = await Blog.findById(id).populate('author', 'firstName lastName').populate('comments.user', 'firstName lastName').lean();
        if (!blog) {
            return sendError(res, 404, 'Blog not found');
        }
        sendSuccess(res, 200, { blog });
    } catch (error) {
        logger.error('getBlogById error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

export const likeBlog = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid blog id');

        // Find the blog first to check if it exists and determine the current like state
        const blog = await Blog.findById(id);
        if (!blog) return sendError(res, 404, 'Blog not found');

        const userId = req.user._id;
        const isLiked = blog.likes.includes(userId);

        const updatedBlog = await blogModel.findByIdAndUpdate(
            id,
            isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
            { new: true }
        );

        sendSuccess(res, 200, { blog: updatedBlog });
    } catch (error) {
        logger.error('likeBlog error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

export const commentOnBlog = async (req, res) => {
    try {
        const { text } = req.body;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid blog id');

        const newComment = {
            user: req.user._id,
            text
        };

        const updatedBlog = await blogModel.findByIdAndUpdate(
            id,
            { $push: { comments: newComment } },
            { new: true }
        );

        if (!updatedBlog) return sendError(res, 404, 'Blog not found');

        sendSuccess(res, 201, { blog: updatedBlog });
    } catch (error) {
        logger.error('commentOnBlog error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

export const generateBlogContent = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic || typeof topic !== 'string' || topic.trim().length === 0 || topic.trim().length > 200) {
            return sendError(res, 400, 'Invalid topic. Please provide a topic between 1 and 200 characters.');
        }

        const prompt = `Write a professional blog post of about 100 words on the topic: "${topic.trim().slice(0, 200)}".`;
        const content = await generateContent({
            prompt,
            modelName: 'gemini-pro',
            temperature: 0.7
        });

        sendSuccess(res, 200, { content });
    } catch (error) {
        logger.error('generateBlogContent error:', error);
        sendError(res, 500, 'Failed to generate blog content. Please try again later.');
    }
};
