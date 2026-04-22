import projectModel from '../models/project.model.js';
import userModel from '../models/user.model.js';
import { withCache } from '../utils/cache.js';
import mongoose from 'mongoose';

// Basic recursive validation to ensure fileTree is a plain JSON-like structure
// and does not contain MongoDB operator-style keys (starting with '$' or containing '.').
const validateFileTree = (value) => {
  const validateNode = (node) => {
    if (node === null || node === undefined) {
      return;
    }

    const nodeType = typeof node;
    if (nodeType === 'string' || nodeType === 'number' || nodeType === 'boolean') {
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        validateNode(item);
      }
      return;
    }

    if (nodeType === 'object') {
      const proto = Object.getPrototypeOf(node);
      if (proto !== Object.prototype && proto !== null) {
        throw new Error('Invalid fileTree');
      }
      for (const key of Object.keys(node)) {
        if (key.startsWith('$') || key.includes('.')) {
          throw new Error('Invalid fileTree');
        }
        validateNode(node[key]);
      }
      return;
    }

    throw new Error('Invalid fileTree');
  };

  if (value === undefined) {
    throw new Error('fileTree is required');
  }

  const valueType = typeof value;
  if (value !== null && (valueType !== 'object' || Array.isArray(value))) {
    throw new Error('Invalid fileTree');
  }

  validateNode(value);
};

export const createProject = async ({ name, userId, category, users = [] }) => {
  if (!name || !category) {
    throw new Error('Name and category are required');
  }
  if (!userId) {
    throw new Error('UserId is required');
  }

  try {
    const project = await projectModel.create({
      name,
      category,
      users: [...new Set([...users, userId])],
      createdBy: userId
    });

    await userModel.findByIdAndUpdate(userId, { $inc: { projects: 1 } });

    return project;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Project name already exists');
    }
    throw error;
  }
};

export const getUserProjects = async (userEmail) => {
  const user = await userModel.findOne({ email: userEmail });
  if (!user) throw new Error('User not found');

  return await projectModel.find({ users: { $in: [user._id] } });
};

export const getProjectById = async ({ projectId, userId }) => {
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users', '_id firstName lastName');

    if (!project) {
        throw new Error("Project not found");
    }

    if (userId) {
        const isMember = project.users.some(u => u._id && u._id.toString() === userId.toString());
        if (!isMember) {
            throw new Error("Unauthorized access");
        }
    }

    if (project && (!project.fileTree || typeof project.fileTree !== 'object')) {
        project.fileTree = {};
    }

    return project;
};

export const addUsersToProject = async ({ projectId, users, userId }) => {
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }
    if (!users || !Array.isArray(users)) {
        throw new Error("users are required");
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId");
    }

    const project = await projectModel.findOne({ _id: projectId, users: userId });
    if (!project) {
        throw new Error("Unauthorized access");
    }

    return await projectModel.findOneAndUpdate(
        { _id: projectId },
        { $addToSet: { users: { $each: users } } },
        { new: true }
    );
};

export const updateFileTree = async ({ projectId, fileTree, userId }) => {
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }

    validateFileTree(fileTree);
    const safeFileTree = JSON.parse(JSON.stringify(fileTree));

    if (userId) {
        const project = await projectModel.findOne({ _id: projectId, users: userId });
        if (!project) throw new Error("Unauthorized access");
    }

    return await projectModel.findOneAndUpdate(
        { _id: projectId },
        { $set: { fileTree: safeFileTree } },
        { new: true }
    );
};

export const getCountsByCategory = async (userEmail) => {
    const allCategories = [
        'DSA', 'Frontend Development', 'Backend Development', 'Fullstack Development',
        'Code Review & Optimization', 'Testing & QA', 'API Development', 'Database Engineering',
        'Software Architecture', 'Version Control & Git', 'Agile Project Management',
        'CI/CD Automation', 'Debugging & Troubleshooting', 'Documentation Generation', 'Code Refactoring'
    ];

    const user = await userModel.findOne({ email: userEmail });
    if (!user) throw new Error('User not found');

    const counts = await projectModel.aggregate([
        { $match: { users: { $in: [user._id] } } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const result = {};
    allCategories.forEach(cat => { result[cat] = 0; });
    counts.forEach(item => {
        if (result.hasOwnProperty(item._id)) result[item._id] = item.count;
    });
    return result;
};

export const getShowcase = async () => {
    return await withCache('projects:showcase', 600, async () => {
        return await projectModel.find({}).sort({ users: -1 }).limit(10);
    });
};

export const getSettings = async (projectId, userId) => {
    const project = await projectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    const isMember = project.users && project.users.some(u => u.toString() === userId.toString());
    if (!isMember) throw new Error('Unauthorized access');

    return project.settings || {};
};

export const updateSettings = async (projectId, userId, settings) => {
    const project = await projectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    const isMember = project.users && project.users.some(u => u.toString() === userId.toString());
    if (!isMember) throw new Error('Unauthorized access');

    project.settings = settings;
    await project.save();
    return project.settings;
};

export const updateSidebarSettings = async (projectId, userId, sidebar) => {
    if (!sidebar || typeof sidebar !== 'object') throw new Error('Sidebar settings required');

    const project = await projectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    const isMember = project.users && project.users.some(u => u.toString() === userId.toString());
    if (!isMember) throw new Error('Unauthorized access');

    project.settings = project.settings || {};
    project.settings.sidebar = { ...project.settings.sidebar, ...sidebar };
    await project.save();
    return project.settings.sidebar;
};
