export const getAllProject = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(401).json({ error: 'User not found' });
        }
        // Find all projects where user is a member
        const projects = await projectModel.find({ users: { $in: [loggedInUser._id] } });
        res.status(200).json({ projects });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const createProject = async (req, res) => {
    try {
        const { name, category, users } = req.body;
        if (!name || !category) {
            return res.status(400).json({ error: 'Name and category are required' });
        }
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(401).json({ error: 'User not found' });
        }
        // Create new project
        const project = await projectModel.create({
            name,
            category,
            users: users ? [...users, loggedInUser._id] : [loggedInUser._id],
            createdBy: loggedInUser._id
        });
        res.status(201).json({ project });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        });
        return res.status(200).json({ project });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}
// Update only sidebar settings for a project (deep merge)
export const updateProjectSidebarSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sidebar } = req.body;
        if (!sidebar || typeof sidebar !== 'object') {
            return res.status(400).json({ error: 'Sidebar settings required' });
        }
        const project = await projectModel.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        // Deep merge sidebar settings
        project.settings = project.settings || {};
        project.settings.sidebar = { ...project.settings.sidebar, ...sidebar };
        await project.save();
        res.status(200).json({ sidebar: project.settings.sidebar });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';

// Get project counts by category
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
    // Get logged-in user
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    if (!loggedInUser) {
      return res.status(401).json({ error: 'User not found' });
    }
    // Aggregate project counts by category, filtered by user
    const counts = await projectModel.aggregate([
      { $match: { users: { $in: [loggedInUser._id] } } },
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
    res.status(500).json({ error: err.message });
  }
}

export const getProjectShowcase = async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ users: -1 }).limit(10);
        res.status(200).json({ projects });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const addUsersToProject = async (req, res) => {
    try {

        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })


        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project,
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }


}

export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {

        const project = await projectService.getProjectById({ projectId });

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
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
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}

export const getProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectModel.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.status(200).json({ settings: project.settings || {} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { settings } = req.body;
        const project = await projectModel.findByIdAndUpdate(
            projectId,
            { settings },
            { new: true }
        );
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.status(200).json({ settings: project.settings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};