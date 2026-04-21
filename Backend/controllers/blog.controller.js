import Blog from '../models/blog.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        const newBlog = new Blog({
            title,
            content,
            author: req.user._id
        });

        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        logger.error('createBlog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find()
            .populate('author', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Blog.countDocuments();

        res.status(200).json({
            blogs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('getAllBlogs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });
        const blog = await Blog.findById(id).populate('author', 'firstName lastName').populate('comments.user', 'firstName lastName');
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        logger.error('getBlogById error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const likeBlog = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

        const userId = req.user._id;

        // Use atomic operations to toggle like
        let blog = await Blog.findOneAndUpdate(
            { _id: id, likes: userId },
            { $pull: { likes: userId } },
            { new: true }
        );

        if (!blog) {
            blog = await Blog.findOneAndUpdate(
                { _id: id },
                { $addToSet: { likes: userId } },
                { new: true }
            );
        }

        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        res.status(200).json(blog);
    } catch (error) {
        logger.error('likeBlog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const commentOnBlog = async (req, res) => {
    try {
        const { text } = req.body;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

        const blog = await Blog.findByIdAndUpdate(
            id,
            { $push: { comments: { user: req.user._id, text } } },
            { new: true }
        ).populate('comments.user', 'firstName lastName');

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.status(201).json(blog);
    } catch (error) {
        logger.error('commentOnBlog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const generateBlogContent = async (req, res) => {
    try {
        const { topic } = req.body;
        if (typeof topic !== 'string' || topic.trim().length === 0 || topic.trim().length > 200) return res.status(400).json({ error: 'Invalid topic' });
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Write a professional blog post of about 100 words on the topic: "${topic.trim().slice(0,200)}".`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ content: text });
    } catch (error) {
        logger.error('generateBlogContent error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
