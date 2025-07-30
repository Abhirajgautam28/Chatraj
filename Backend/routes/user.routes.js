import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register',
  body('firstName').isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').isLength({ min: 2 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('googleApiKey').isLength({ min: 10 }).withMessage('Google API Key is required'),
  userController.createUserController
);

router.post('/verify-otp', userController.verifyOtpController);

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
