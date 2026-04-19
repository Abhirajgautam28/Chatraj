import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';
import { sensitiveLimiter, authLimiter, leaderboardLimiter, usersLimiter, registrationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Send OTP for password reset (used in Login.jsx)
router.post('/send-otp', sensitiveLimiter, userController.sendOtpController);

router.post('/register',
  body('firstName').isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').isLength({ min: 2 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('googleApiKey').isLength({ min: 10 }).withMessage('Google API Key is required'),
  registrationLimiter,
  userController.createUserController
);

router.post('/verify-otp', sensitiveLimiter, userController.verifyOtpController);

// Admin-only endpoint to fetch masked OTPs for debugging. Requires ADMIN_API_KEY header `x-admin-key`.
router.get('/admin/otp', sensitiveLimiter, userController.adminGetOtpController);

router.post('/login',
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
  sensitiveLimiter,
  userController.loginController
);

router.post('/reset-password', sensitiveLimiter, userController.resetPasswordController);
router.post('/update-password', sensitiveLimiter, userController.updatePasswordController);

router.get('/profile', authLimiter, authMiddleware.authUser, userController.profileController);

router.get('/logout', sensitiveLimiter, userController.logoutController);

router.get('/all', authLimiter, authMiddleware.authUser, userController.getAllUsersController);

router.get('/leaderboard', leaderboardLimiter, userController.getLeaderboardController);

export default router;
