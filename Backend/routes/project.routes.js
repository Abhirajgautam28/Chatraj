
import { Router } from 'express';
import { body } from 'express-validator';
import { projectLimiter } from '../middleware/rateLimiter.js';
import {
  getProjectCountsByCategory,
  updateProjectSidebarSettings,
  createProject,
  getAllProject,
  addUserToProject,
  getProjectById,
  updateFileTree,
  getProjectSettings,
  updateProjectSettings,
  getProjectShowcase
} from '../controllers/project.controller.js';
import { authUser } from '../middleware/auth.middleware.js';

const router = Router();

// Add project counts by category route
router.get('/category-counts',
    projectLimiter,
    authUser,
    getProjectCountsByCategory
);

// Update only sidebar settings for a project
router.put('/sidebar-settings/:projectId',
    projectLimiter,
    authUser,
    updateProjectSidebarSettings
);


router.post('/create',
    projectLimiter,
    authUser,
    body('name').isString().withMessage('Name is required'),
    body('category').isString().withMessage('Category is required'),
    body('users').optional().isArray().withMessage('Users must be an array'),
    createProject
)

router.get('/all',
    projectLimiter,
    authUser,
    getAllProject
)

router.put('/add-user',
    projectLimiter,
    authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    addUserToProject
)

router.get('/get-project/:projectId',
    projectLimiter,
    authUser,
    getProjectById
)

router.put('/update-file-tree',
    projectLimiter,
    authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    updateFileTree
)

router.get('/settings/:projectId',
    projectLimiter,
    authUser,
    getProjectSettings
)

router.put('/settings/:projectId',
    projectLimiter,
    authUser,
    updateProjectSettings
)

router.get('/showcase', projectLimiter, getProjectShowcase);


export default router;