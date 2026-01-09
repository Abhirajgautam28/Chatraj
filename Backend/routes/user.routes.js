import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';
import { sensitiveLimiter, authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Send OTP for password reset (used in Login.jsx)
router.post('/send-otp', sensitiveLimiter, userController.sendOtpController);

router.post('/register',
  body('firstName').isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').isLength({ min: 2 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('googleApiKey').isLength({ min: 10 }).withMessage('Google API Key is required'),
  sensitiveLimiter,
  userController.createUserController
);

router.post('/verify-otp', sensitiveLimiter, userController.verifyOtpController);

router.post('/login',
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
  sensitiveLimiter,
  userController.loginController
);

router.post('/reset-password', userController.resetPasswordController);
router.post('/update-password', userController.updatePasswordController);

router.get('/profile', authLimiter, authMiddleware.authUser, userController.profileController);

router.get('/logout', sensitiveLimiter, userController.logoutController);

router.get('/all', authLimiter, authMiddleware.authUser, userController.getAllUsersController);

router.get('/leaderboard', userController.getLeaderboardController);

export default router;
