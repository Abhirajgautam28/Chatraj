import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

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

export const getProjectById = async ({ projectId }) => {
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

    // Always return a valid fileTree object
    if (project && (!project.fileTree || typeof project.fileTree !== 'object')) {
        project.fileTree = {};
    }

    return project;
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
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