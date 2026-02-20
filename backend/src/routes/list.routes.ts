import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createList,
  updateList,
  deleteList,
  reorderLists,
} from '../controllers/list.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create list
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('boardId').isMongoId().withMessage('Valid board ID is required'),
    validate,
  ],
  createList
);

// Update list
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid list ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('position').optional().isNumeric().withMessage('Position must be a number'),
    validate,
  ],
  updateList
);

// Delete list
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid list ID'),
    validate,
  ],
  deleteList
);

// Reorder lists
router.post(
  '/reorder',
  [
    body('boardId').isMongoId().withMessage('Valid board ID is required'),
    body('lists').isArray().withMessage('Lists must be an array'),
    validate,
  ],
  reorderLists
);

export default router;

