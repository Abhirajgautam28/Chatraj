import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import { generateResult } from './ai.service.js';

export const createBlog = async ({ title, content, userEmail }) => {
    const author = await User.findOne({ email: userEmail });
    if (!author) {
        throw new Error('User not found');
    }

    const newBlog = new Blog({
        title,
        content,
        author: author._id
    });

    await newBlog.save();
    return newBlog;
};

export const getAllBlogs = async () => {
    return await Blog.find().populate('author', 'firstName lastName').sort({ createdAt: -1 });
};

export const getBlogById = async (id) => {
    const blog = await Blog.findById(id)
        .populate('author', 'firstName lastName')
        .populate('comments.user', 'firstName lastName');
    return blog;
};

export const likeBlog = async (id, userEmail) => {
    const blog = await Blog.findById(id);
    if (!blog) throw new Error('Blog not found');

    const user = await User.findOne({ email: userEmail });
    if (!user) throw new Error('User not found');

    const likedIndex = blog.likes.indexOf(user._id);

    if (likedIndex > -1) {
        blog.likes.splice(likedIndex, 1);
    } else {
        blog.likes.push(user._id);
    }

    await blog.save();
    return blog;
};

export const commentOnBlog = async (id, userEmail, text) => {
    const blog = await Blog.findById(id);
    if (!blog) throw new Error('Blog not found');

    const user = await User.findOne({ email: userEmail });
    if (!user) throw new Error('User not found');

    const newComment = {
        user: user._id,
        text
    };

    blog.comments.push(newComment);
    await blog.save();
    return blog;
};

export const generateBlogContent = async (topic) => {
    if (!topic || topic.trim().length === 0 || topic.trim().length > 200) {
        throw new Error('Invalid topic');
    }
    const prompt = `Write a professional blog post of about 100 words on the topic: "${topic.trim().slice(0, 200)}".`;
    const result = await generateResult(prompt);
    // AI service might return a stringified object or raw text.
    try {
        const parsed = JSON.parse(result);
        return parsed.text || result;
    } catch (e) {
        return result;
    }
};
