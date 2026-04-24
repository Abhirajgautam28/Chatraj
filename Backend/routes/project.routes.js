import { Router } from 'express';
import { body } from 'express-validator';
import {
    createProject,
    getAllProject,
    addUserToProject,
    getProjectById,
    updateFileTree,
    getProjectSettings,
    updateProjectSettings,
    getProjectShowcase,
    updateProjectSidebarSettings,
    getProjectMessages,
    getProjectCountsByCategory
} from '../controllers/project.controller.js';
import { authUser } from '../middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const projectLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

router.post('/create', authUser, body('name').isString(), body('category').isString(), createProject);
router.get('/all', authUser, getAllProject);
router.put('/add-user', authUser, body('projectId').isString(), body('users').isArray(), addUserToProject);
router.get('/get-project/:projectId', authUser, getProjectById);
router.put('/update-file-tree', authUser, updateFileTree);
router.get('/messages/:projectId', authUser, getProjectMessages);
router.get('/counts-by-category', authUser, getProjectCountsByCategory);
router.get('/settings/:projectId', authUser, getProjectSettings);
router.put('/settings/:projectId', authUser, updateProjectSettings);
router.put('/sidebar-settings/:projectId', authUser, updateProjectSidebarSettings);
router.get('/showcase', getProjectShowcase);

export default router;
