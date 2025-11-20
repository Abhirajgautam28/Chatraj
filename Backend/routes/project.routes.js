
import { Router } from 'express';
import { body } from 'express-validator';
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
    authUser,
    getProjectCountsByCategory
);

// Update only sidebar settings for a project
router.put('/sidebar-settings/:projectId',
    authUser,
    updateProjectSidebarSettings
);


router.post('/create',
    authUser,
    body('name').isString().withMessage('Name is required'),
    body('category').isString().withMessage('Category is required'),
    body('users').optional().isArray().withMessage('Users must be an array'),
    createProject
)

router.get('/all',
    authUser,
    getAllProject
)

router.put('/add-user',
    authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    addUserToProject
)

router.get('/get-project/:projectId',
    authUser,
    getProjectById
)

router.put('/update-file-tree',
    authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    updateFileTree
)

router.get('/settings/:projectId',
    authUser,
    getProjectSettings
)

router.put('/settings/:projectId',
    authUser,
    updateProjectSettings
)

router.get('/showcase', getProjectShowcase);


export default router;