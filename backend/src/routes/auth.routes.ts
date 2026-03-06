import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Register - validation removed as credentials are encrypted
// Validation happens after decryption in the controller
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role')
      .optional()
      .isIn(['admin', 'editor', 'viewer'])
      .withMessage('Invalid role'),
    validate,
  ],
  register
);

// Login - validation removed as credentials are encrypted
// Validation happens after decryption in the controller
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  login
);

// Get current user
router.get('/me', authenticate, getMe);

export default router;

