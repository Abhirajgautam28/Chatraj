import * as projectService from '../services/project.service.js';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

export const getAllProject = async (req, res) => {
    try {
        // Find all projects where user is a member
        const projects = await projectModel.find({ users: { $in: [req.user._id] } }).lean();
        res.status(200).json({ projects });
    } catch (err) {
        logger.error('getAllProject error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(res, 'Validation failed', 400, errors.array());

    try {
        const { name, category, users } = req.body;
        // NOTE: category validation is handled by route validator now,
        // but kept here for safety if validator fails or is bypassed.
        if (!name || !category) {
            return res.status(400).json({ error: 'Name and category are required' });
        }
        // Create new project
        const project = await projectModel.create({
            name,
            category,
            users: users ? [...users, req.user._id] : [req.user._id],
            createdBy: req.user._id
        });
        return response.success(res, { project }, 'Project created successfully', 201);
    } catch (err) {
        logger.error('createProject error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(res, 'Validation failed', 400, errors.array());

    try {
        const { projectId, users } = req.body;
        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: req.user._id
        });
        return response.success(res, { project }, 'Users added successfully');
    } catch (err) {
        logger.error('addUserToProject error:', err);
        res.status(400).json({ error: err.message });
    }
}

export const updateProjectSidebarSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sidebar } = req.body;
        const result = await projectService.updateSidebarSettings(projectId, req.user._id, sidebar);
        return response.success(res, { sidebar: result });
    } catch (err) {
        const status = err.message === 'Unauthorized access' ? 401 : (err.message === 'Project not found' ? 404 : 400);
        return response.error(res, err.message, status);
    }
};

export const getProjectCountsByCategory = async (req, res) => {
  try {
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
    // Aggregate project counts by category, filtered by user
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
    res.status(200).json(result);
  } catch (err) {
        logger.error('getProjectCountsByCategory error:', err);
        res.status(500).json({ error: 'Internal server error' });
  }
}

export const getProjectShowcase = async (req, res) => {
    try {
        const projects = await projectModel.find({}).sort({ users: -1 }).limit(10);
        res.status(200).json({ projects });
    } catch (error) {
        logger.error('getProjectShowcase error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getProjectById = async (req, res) => {
    try {
        const project = await projectService.getProjectById({
            projectId: req.params.projectId,
            userId: req.user._id
        });
        return response.success(res, { project });
    } catch (err) {
        logger.error('getProjectById error:', err);
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        res.status(status).json({ error: err.message })
    }
}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(res, 'Validation failed', 400, errors.array());

    try {
        const { projectId, fileTree } = req.body;
        const project = await projectService.updateFileTree({
            projectId, fileTree, userId: req.user._id
        })
        return response.success(res, { project }, 'File tree updated successfully');
    } catch (err) {
        logger.error('updateFileTree error:', err);
        const status = err.message === 'Unauthorized access' ? 401 : 400;
        return response.error(res, err.message, status);
    }
}

export const getProjectSettings = async (req, res) => {
    try {
        const settings = await projectService.getSettings(req.params.projectId, req.user._id);
        return response.success(res, { settings });
    } catch (err) {
        logger.error('getProjectSettings error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const settings = await projectService.updateSettings(req.params.projectId, req.user._id, req.body.settings);
        return response.success(res, { settings }, 'Settings updated successfully');
    } catch (err) {
        logger.error('updateProjectSettings error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
