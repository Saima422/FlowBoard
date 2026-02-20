import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create task
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('listId').isMongoId().withMessage('Valid list ID is required'),
    body('boardId').isMongoId().withMessage('Valid board ID is required'),
    body('description').optional().trim(),
    body('assignedTo').optional().isArray().withMessage('AssignedTo must be an array'),
    body('labels').optional().isArray().withMessage('Labels must be an array'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    validate,
  ],
  createTask
);

// Update task
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('assignedTo').optional().isArray().withMessage('AssignedTo must be an array'),
    body('labels').optional().isArray().withMessage('Labels must be an array'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('isCompleted').optional().isBoolean().withMessage('isCompleted must be boolean'),
    body('position').optional().isNumeric().withMessage('Position must be a number'),
    validate,
  ],
  updateTask
);

// Delete task
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    validate,
  ],
  deleteTask
);

// Move task
router.post(
  '/:id/move',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('sourceListId').isMongoId().withMessage('Valid source list ID is required'),
    body('destinationListId').isMongoId().withMessage('Valid destination list ID is required'),
    body('sourcePosition').isNumeric().withMessage('Source position must be a number'),
    body('destinationPosition').isNumeric().withMessage('Destination position must be a number'),
    validate,
  ],
  moveTask
);

// Reorder tasks
router.post(
  '/reorder',
  [
    body('listId').isMongoId().withMessage('Valid list ID is required'),
    body('tasks').isArray().withMessage('Tasks must be an array'),
    validate,
  ],
  reorderTasks
);

export default router;

