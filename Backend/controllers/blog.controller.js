import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { withCache, invalidateCache } from '../utils/cache.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const createBlog = async (req, res) => {
    try {
        const { title, content, summary } = req.body;
        // Use req.user._id directly from optimized JWT payload
        const newBlog = new Blog({
            title,
            content,
            summary: summary || (content ? content.slice(0, 150) + '...' : ''),
            author: req.user._id
        });

        await newBlog.save();
        // Invalidate blog list cache using tag AFTER successful save
        await invalidateCache('blog:all', true);
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const { limit = 20, skip = 0, search } = req.query;
        const cacheKey = `blog:list:${limit}:${skip}:${search || 'none'}`;

        const data = await withCache(cacheKey, 300, async () => {
            const query = {};
            if (search) {
                query.$text = { $search: search };
            }

            const blogs = await Blog.find(query, search ? { score: { $meta: 'textScore' } } : {})
                .select('-content -comments')
                .populate('author', 'firstName lastName')
                .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
                .limit(Math.min(parseInt(limit, 10), 50))
                .skip(parseInt(skip, 10))
                .lean();

            const total = await Blog.countDocuments(query);
            return { blogs, total };
        }, ['blog:all']);

        res.status(200).json(data);
    } catch (error) {
        console.error('getAllBlogs error:', error);
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
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const likeBlog = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid blog id' });

        // Use req.user._id directly from optimized JWT payload
        const userId = req.user._id;

        // Atomic toggle logic: try to remove user._id, if not found, add it.
        // First attempt removal.
        let blog = await Blog.findOneAndUpdate(
            { _id: id, likes: userId },
            { $pull: { likes: userId } },
            { new: true }
        );

        if (!blog) {
            // If removal did nothing, it means user hasn't liked it yet. Add it.
            blog = await Blog.findOneAndUpdate(
                { _id: id },
                { $addToSet: { likes: userId } },
                { new: true }
            );
        }

        if (blog) {
            // Ensure consistency: lean populate
            blog = await Blog.findById(id).populate('author', 'firstName lastName').lean();
        }

        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        // Invalidate list cache as like count might be displayed using tag
        await invalidateCache('blog:all', true);
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

        // Use req.user._id directly from optimized JWT payload
        const blog = await Blog.findByIdAndUpdate(
            id,
            { $push: { comments: { user: req.user._id, text } } },
            { new: true }
        ).populate('author', 'firstName lastName').populate('comments.user', 'firstName lastName').lean();

        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        // Invalidate list cache AFTER successful update
        await invalidateCache('blog:all', true);
        res.status(201).json(blog);
    } catch (error) {
        console.error('commentOnBlog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const generateBlogContent = async (req, res) => {
    try {
        const { topic } = req.body;
        if (typeof topic !== 'string' || topic.trim().length === 0 || topic.trim().length > 200) return res.status(400).json({ error: 'Invalid topic' });

        const cacheKey = `ai:blog:${Buffer.from(topic.trim()).toString('base64')}`;
        const content = await withCache(cacheKey, 3600 * 48, async () => {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const prompt = `Write a professional blog post of about 100 words on the topic: "${topic.trim().slice(0,200)}".`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }, ['ai:blog']);

        res.status(200).json({ content });
    } catch (error) {
        console.error('generateBlogContent error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
