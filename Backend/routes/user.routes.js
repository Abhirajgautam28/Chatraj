import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register',
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
  userController.createUserController
);

router.post('/login',
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
  userController.loginController
);

router.post('/reset-password', userController.resetPasswordController);
router.post('/update-password', userController.updatePasswordController);

router.get('/profile', authMiddleware.authUser, userController.profileController);

router.get('/logout', userController.logoutController);

router.get('/all', authMiddleware.authUser, userController.getAllUsersController);

export default router;
