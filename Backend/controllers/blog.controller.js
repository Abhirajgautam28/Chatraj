import Blog from '../models/blog.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        const newBlog = new Blog({
            title,
            content,
            author: req.user._id
        });

        await newBlog.save();
        res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error) {
        logger.error('createBlog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'firstName lastName').sort({ createdAt: -1 }).lean();
        res.status(200).json(blogs);
    } catch (error) {
        logger.error('getAllBlogs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });
        const blog = await Blog.findById(id).populate('author', 'firstName lastName').populate('comments.user', 'firstName lastName').lean();
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

        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Atomic toggle logic: try to remove user._id, if not found, add it.
        // First attempt removal.
        let blog = await Blog.findOneAndUpdate(
            { _id: id, likes: user._id },
            { $pull: { likes: user._id } },
            { new: true }
        );

        if (!blog) {
            // If removal did nothing, it means user hasn't liked it yet. Add it.
            blog = await Blog.findOneAndUpdate(
                { _id: id },
                { $addToSet: { likes: user._id } },
                { new: true }
            );
        }

        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.status(200).json(blog);
    } catch (error) {
        console.error('likeBlog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const commentOnBlog = async (req, res) => {
    try {
        const { text } = req.body;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(401).json({ error: 'User not found' });

        const blog = await Blog.findByIdAndUpdate(
            id,
            { $push: { comments: { user: user._id, text } } },
            { new: true }
        ).populate('author', 'firstName lastName').populate('comments.user', 'firstName lastName');

        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.status(201).json(blog);
    } catch (error) {
        console.error('commentOnBlog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const generateBlogContent = async (req, res) => {
    try {
        const { topic } = req.body;
        if (typeof topic !== 'string' || topic.trim().length === 0 || topic.trim().length > 200) {
            return res.status(400).json({ error: 'Invalid topic. Please provide a topic between 1 and 200 characters.' });
        }

        const prompt = `Write a professional blog post of about 100 words on the topic: "${topic.trim().slice(0,200)}".`;
        const content = await generateContent({
            prompt,
            modelName: 'gemini-pro',
            temperature: 0.7
        });

        res.status(200).json({ content });
    } catch (error) {
        logger.error('generateBlogContent error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
