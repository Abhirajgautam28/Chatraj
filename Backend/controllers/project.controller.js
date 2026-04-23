import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

export const getAllProject = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Optimization: Find all projects where user is a member, use lean and projection
        const projects = await projectModel.find({ users: { $in: [userId] } })
            .select('-fileTree')
            .lean();
        res.status(200).json({ projects });
    } catch (err) {
        console.error('getAllProject error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, category, users } = req.body;
        const userId = req.user._id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        if (!name || !category) {
            return res.status(400).json({ error: 'Name and category are required' });
        }

        // Atomic project creation
        const project = await projectModel.create({
            name,
            category,
            users: users ? [...users, userId] : [userId],
            createdBy: userId
        });
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
        const userId = req.user._id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId
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

        const userId = req.user._id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Optimization: Prepare atomic update with dot notation
        const update = {};
        for (const [key, value] of Object.entries(sidebar)) {
            update[`settings.sidebar.${key}`] = value;
        }

        const project = await projectModel.findOneAndUpdate(
            { _id: projectId, users: userId },
            { $set: update },
            { new: true }
        ).lean();

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
    const userId = req.user._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const allCategories = [
      'DSA', 'Frontend Development', 'Backend Development', 'Fullstack Development',
      'Code Review & Optimization', 'Testing & QA', 'API Development', 'Database Engineering',
      'Software Architecture', 'Version Control & Git', 'Agile Project Management',
      'CI/CD Automation', 'Debugging & Troubleshooting', 'Documentation Generation', 'Code Refactoring'
    ];

    // Aggregate project counts by category, filtered by user ID from optimized JWT
    const counts = await projectModel.aggregate([
      { $match: { users: { $in: [new mongoose.Types.ObjectId(userId)] } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {};
    allCategories.forEach(cat => result[cat] = 0);
    counts.forEach(item => {
      if (result.hasOwnProperty(item._id)) result[item._id] = item.count;
    });
    res.status(200).json(result);
  } catch (err) {
        console.error('getProjectCountsByCategory error:', err);
        res.status(500).json({ error: 'Internal server error' });
  }
}

export const getProjectShowcase = async (req, res) => {
    try {
        // Optimization: Lean and projection for showcase
        const projects = await projectModel.find({})
            .select('-fileTree')
            .sort({ users: -1 })
            .limit(10)
            .lean();
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

        const userId = req.user._id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const project = await projectModel.findOne({ _id: projectId, users: userId })
            .select('settings')
            .lean();

        if (!project) return res.status(404).json({ error: 'Project not found or Unauthorized' });
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

        const userId = req.user._id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Atomic update settings while verifying membership
        const project = await projectModel.findOneAndUpdate(
            { _id: projectId, users: userId },
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
