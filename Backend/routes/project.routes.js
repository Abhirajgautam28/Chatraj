
import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleWare from '../middleware/auth.middleware.js';
import { updateProjectSidebarSettings } from '../controllers/project.controller.js';

const router = Router();

// Update only sidebar settings for a project
router.put('/sidebar-settings/:projectId',
    authMiddleWare.authUser,
    updateProjectSidebarSettings
);


router.post('/create',
    authMiddleWare.authUser,
    body('name').isString().withMessage('Name is required'),
    projectController.createProject
)

router.get('/all',
    authMiddleWare.authUser,
    projectController.getAllProject
)

router.put('/add-user',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
)

router.get('/get-project/:projectId',
    authMiddleWare.authUser,
    projectController.getProjectById
)

router.put('/update-file-tree',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    projectController.updateFileTree
)

router.get('/settings/:projectId',
    authMiddleWare.authUser,
    projectController.getProjectSettings
)

router.put('/settings/:projectId',
    authMiddleWare.authUser,
    projectController.updateProjectSettings
)


export default router;