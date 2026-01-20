import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

// Basic recursive validation to ensure fileTree is a plain JSON-like structure
// and does not contain MongoDB operator-style keys (starting with '$' or containing '.').
const validateFileTree = (value) => {
  const validateNode = (node) => {
    if (node === null || node === undefined) {
      // Treat null/undefined as simple literal values; they are not traversed further.
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
      // Only allow plain objects (no special prototypes like Date, ObjectId, etc.)
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

    // Disallow functions, symbols, etc.
    throw new Error('Invalid fileTree');
  };

  // Allow null as an explicit "no fileTree" value, but still reject undefined.
  if (value === undefined) {
    throw new Error('fileTree is required');
  }

  const valueType = typeof value;
  // Root must be a non-array plain object or null
  if (value !== null && (valueType !== 'object' || Array.isArray(value))) {
    throw new Error('Invalid fileTree');
  }

  validateNode(value);
};

export const createProject = async ({ name, userId, category }) => {
  if (!name) {
    throw new Error('Name is required');
  }
  if (!userId) {
    throw new Error('UserId is required');
  }
  if (!category) {
    throw new Error('Category is required');
  }

  let project;
  try {
    project = await projectModel.create({
      name,
      users: [userId],
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Project name already exists');
    }
    throw error;
  }

  return project;
};

export const getAllProjectByUserId = async ({ userId, category }) => {
  if (!userId) {
    throw new Error('UserId is required');
  }

  const query = {
    users: { $in: [userId] }
  };

  if (category) {
    query.category = category;
  }

  const allUserProjects = await projectModel.find(query);
  return allUserProjects;
};

export const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!users) {
        throw new Error("users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }


    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    // ...removed console.log for production cleanliness

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })

    return updatedProject



}

export const getProjectById = async ({ projectId, userId }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    // Populate only _id, firstName, lastName for users
    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users', '_id firstName lastName')

    if (!project) {
        throw new Error("Project not found");
    }

    // Check if requesting user is a member
    if (userId) {
        const isMember = project.users.some(u => u._id && u._id.toString() === userId.toString());
        if (!isMember) {
            throw new Error("Unauthorized access");
        }
    }

    // Always return a valid fileTree object
    if (project && (!project.fileTree || typeof project.fileTree !== 'object')) {
        project.fileTree = {};
    }

    return project;
}

export const updateFileTree = async ({ projectId, fileTree, userId }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    // Validate fileTree structure to prevent injection of MongoDB operators or invalid types
    validateFileTree(fileTree);

    if (userId) {
        const project = await projectModel.findOne({
            _id: projectId,
            users: userId
        });

        if (!project) {
            throw new Error("Unauthorized access");
        }
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}