import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  addMember,
} from '../controllers/board.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create board
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('backgroundColor').optional().trim(),
    validate,
  ],
  createBoard
);

// Get all boards for user
router.get('/', getBoards);

// Get board by ID
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid board ID'),
    validate,
  ],
  getBoardById
);

// Update board
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid board ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('backgroundColor').optional().trim(),
    validate,
  ],
  updateBoard
);

// Delete board
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid board ID'),
    validate,
  ],
  deleteBoard
);

// Add member to board
router.post(
  '/:id/members',
  [
    param('id').isMongoId().withMessage('Invalid board ID'),
    body('userEmail').isEmail().withMessage('Valid email is required'),
    body('role')
      .optional()
      .isIn(['admin', 'editor', 'viewer'])
      .withMessage('Invalid role'),
    validate,
  ],
  addMember
);

export default router;

