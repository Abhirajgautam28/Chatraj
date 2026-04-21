import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { withCache, invalidateCache } from '../utils/cache.js';
import redisClient from '../services/redis.service.js';

export const getAllProject = async (req, res) => {
    try {
        const { category } = req.query;
        const cacheKey = `user:${req.user._id}:projects:${category || 'all'}`;

        const projects = await withCache(cacheKey, 300, async () => {
            // Use req.user._id directly from optimized JWT payload
            const query = { users: { $in: [req.user._id] } };
            if (category) query.category = category;

            // Exclude heavy fileTree from project list for performance
            return await projectModel.find(query).select('-fileTree').lean();
        }, [`user:${req.user._id}:projects`]);

        res.status(200).json({ projects });
    } catch (err) {
        console.error('getAllProject error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit = 50, before } = req.query;

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: 'Invalid projectId' });
        }

        const query = { conversationId: new mongoose.Types.ObjectId(projectId) };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        // Optimization: Single Optimized MongoDB Aggregation for Chat History
        const messages = await mongoose.model('Message').aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $limit: parseInt(limit, 10) },
            {
                $project: {
                    _id: 1,
                    message: 1,
                    parentMessageId: 1,
                    reactions: 1,
                    deliveredTo: 1,
                    readBy: 1,
                    createdAt: 1,
                    sender: {
                        _id: "$sender._id",
                        firstName: "$sender.firstName",
                        lastName: "$sender.lastName",
                        email: "$sender.email"
                    }
                }
            }
        ]);

        res.status(200).json({ messages: messages.reverse() });
    } catch (err) {
        console.error('getProjectMessages error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, category, users: collaboratorIds } = req.body;
        // Invalidate caches when a new project is created
        await invalidateCache('project:showcase');
        await invalidateCache(`user:${req.user._id}:project-counts`);
        await invalidateCache(`user:${req.user._id}:projects`, true);

        // Update Leaderboard ZSET in background
        if (typeof redisClient.zincrby === 'function') {
           const allUserIds = collaboratorIds ? [...collaboratorIds, req.user._id] : [req.user._id];
           for (const uid of allUserIds) {
               redisClient.zincrby('user:leaderboard:zset', 1, uid.toString()).catch(() => {});
           }
        }

        // NOTE: category validation is handled by route validator now,
        // but kept here for safety if validator fails or is bypassed.
        if (!name || !category) {
            return res.status(400).json({ error: 'Name and category are required' });
        }
        // Use req.user._id directly from optimized JWT payload
        const project = await projectModel.create({
            name,
            category,
            users: collaboratorIds ? [...collaboratorIds, req.user._id] : [req.user._id],
            createdBy: req.user._id
        });

        // Denormalized project count update
        const allUserIds = collaboratorIds ? [...collaboratorIds, req.user._id] : [req.user._id];
        await userModel.updateMany({ _id: { $in: allUserIds } }, { $inc: { projectsCount: 1 } });
        res.status(201).json({ project });
    } catch (err) {
        console.error('createProject error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body;
        // Use req.user._id directly from optimized JWT payload
        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: req.user._id
        });
        return res.status(200).json({ project });
    } catch (err) {
        console.error('addUserToProject error:', err);
        res.status(400).json({ error: err.message });
    }
}

// Update only sidebar settings for a project (shallow merge via atomic update)
export const updateProjectSidebarSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sidebar } = req.body;
        if (!sidebar || typeof sidebar !== 'object') {
            return res.status(400).json({ error: 'Sidebar settings required' });
        }
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ error: 'Invalid projectId' });

        // Prepare atomic update using dot notation to avoid overwriting entire settings object
        const update = {};
        for (const [key, value] of Object.entries(sidebar)) {
            update[`settings.sidebar.${key}`] = value;
        }

        const project = await projectModel.findOneAndUpdate(
            { _id: projectId, users: req.user._id },
            { $set: update },
            { new: true }
        );

        if (!project) return res.status(404).json({ error: 'Project not found or Unauthorized' });
        res.status(200).json({ sidebar: project.settings?.sidebar || {} });
    } catch (err) {
        console.error('updateProjectSidebarSettings error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get project counts by category
export const getProjectCountsByCategory = async (req, res) => {
  try {
    const cacheKey = `user:${req.user._id}:project-counts`;
    const result = await withCache(cacheKey, 60, async () => {
    // List of all categories as in frontend
    const allCategories = [
      'DSA',
      'Frontend Development',
      'Backend Development',
      'Fullstack Development',
      'Code Review & Optimization',
      'Testing & QA',
      'API Development',
      'Database Engineering',
      'Software Architecture',
      'Version Control & Git',
      'Agile Project Management',
      'CI/CD Automation',
      'Debugging & Troubleshooting',
      'Documentation Generation',
      'Code Refactoring'
    ];
    // Aggregate project counts by category, filtered by user from JWT payload
    const counts = await projectModel.aggregate([
      { $match: { users: { $in: [new mongoose.Types.ObjectId(req.user._id)] } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);
    // Convert to { [category]: count }
    const result = {};
    allCategories.forEach(cat => {
      result[cat] = 0;
    });
    counts.forEach(item => {
      if (result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
    });
    return result;
    });
    res.status(200).json(result);
  } catch (err) {
        console.error('getProjectCountsByCategory error:', err);
        res.status(500).json({ error: 'Internal server error' });
  }
}

export const getProjectShowcase = async (req, res) => {
    try {
        const projects = await withCache('project:showcase', 300, async () => {
            // Exclude heavy fileTree from showcase for performance
            return await projectModel.find({}).select('-fileTree').sort({ users: -1 }).limit(10).lean();
        });
        res.status(200).json({ projects });
    } catch (error) {
        console.error('getProjectShowcase error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {
        const project = await projectService.getProjectById({
            projectId,
            userId: req.user._id
        });

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.error('getProjectById error:', err);
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        res.status(status).json({ error: err.message })
    }

}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree,
            userId: req.user._id
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.error('updateFileTree error:', err);
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        res.status(status).json({ error: err.message })
    }

}

export const getProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ error: 'Invalid projectId' });
        const project = await projectModel.findById(projectId).lean();
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const isMember = project.users && project.users.some(u => u.toString() === req.user._id.toString());
        if (!isMember) return res.status(401).json({ error: 'Unauthorized' });
        res.status(200).json({ settings: project.settings || {} });
    } catch (err) {
        console.error('getProjectSettings error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { settings } = req.body;
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ error: 'Invalid projectId' });

        // Atomic update settings while verifying membership
        const project = await projectModel.findOneAndUpdate(
            { _id: projectId, users: req.user._id },
            { $set: { settings } },
            { new: true }
        ).lean();

        if (!project) return res.status(404).json({ error: 'Project not found or Unauthorized' });
        res.status(200).json({ settings: project.settings });
    } catch (err) {
        console.error('updateProjectSettings error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
