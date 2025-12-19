/**
 * Example Controller - Demonstrates all response utility functions
 * 
 * This file shows how to use the common response functions.
 * You can use this as a reference when building your controllers.
 * 
 * @file example.controller.ts
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendInternalError,
  sendError,
  asyncHandler,
} from '../utils/response';

/**
 * Example: Simple GET request with success response
 */
export const getItems = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  // Simulate fetching data
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  // Send success response with data
  sendSuccess(res, 200, 'Items retrieved successfully', { items });
});

/**
 * Example: GET by ID with not found handling
 */
export const getItemById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // Simulate database query
  const item = null; // Simulating not found
  
  if (!item) {
    return sendNotFound(res, `Item with ID ${id} not found`);
  }
  
  sendSuccess(res, 200, undefined, { item });
});

/**
 * Example: POST request with validation and created response
 */
export const createItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description } = req.body;
  
  // Validation
  if (!name || name.trim().length === 0) {
    return sendBadRequest(res, 'Item name is required');
  }
  
  if (name.length > 100) {
    return sendBadRequest(res, 'Item name must be less than 100 characters');
  }
  
  // Check for duplicates
  const existingItem = null; // Simulate database check
  
  if (existingItem) {
    return sendConflict(res, 'An item with this name already exists');
  }
  
  // Create the item
  const newItem = {
    id: Date.now(),
    name: name.trim(),
    description,
    createdAt: new Date(),
  };
  
  // Send created response (HTTP 201)
  sendCreated(res, 'Item created successfully', { item: newItem });
});

/**
 * Example: PUT request with update logic
 */
export const updateItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.userId;
  
  // Find the item
  const item: any = null; // Simulate database query
  
  if (!item) {
    return sendNotFound(res, 'Item not found');
  }
  
  // Check ownership/permissions
  if (item.ownerId !== userId) {
    return sendForbidden(res, 'You do not have permission to update this item');
  }
  
  // Update the item
  if (name) item.name = name.trim();
  if (description !== undefined) item.description = description;
  item.updatedAt = new Date();
  
  sendSuccess(res, 200, 'Item updated successfully', { item });
});

/**
 * Example: DELETE request with no content response
 */
export const deleteItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;
  
  // Find the item
  const item: any = null;
  
  if (!item) {
    return sendNotFound(res, 'Item not found');
  }
  
  // Check ownership
  if (item.ownerId !== userId) {
    return sendForbidden(res, 'You do not have permission to delete this item');
  }
  
  // Delete the item
  // await Item.findByIdAndDelete(id);
  
  // Option 1: Send success with message
  sendSuccess(res, 200, 'Item deleted successfully');
  
  // Option 2: Send no content (HTTP 204)
  // sendNoContent(res);
});

/**
 * Example: Authentication check
 */
export const protectedEndpoint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return sendUnauthorized(res, 'Authentication token is required');
  }
  
  // Verify token logic here...
  const isValid = true;
  
  if (!isValid) {
    return sendUnauthorized(res, 'Invalid or expired token');
  }
  
  sendSuccess(res, 200, 'Access granted', { message: 'You are authenticated!' });
});

/**
 * Example: Paginated list with metadata
 */
export const getPaginatedItems = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Simulate database query
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];
  const total = 50; // Total count from database
  
  // Send response with pagination metadata
  sendSuccess(res, 200, 'Items retrieved', { items }, {
    includeMeta: true,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
});

/**
 * Example: Bulk operation
 */
export const bulkDelete = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return sendBadRequest(res, 'Please provide an array of item IDs');
  }
  
  if (ids.length > 100) {
    return sendBadRequest(res, 'Cannot delete more than 100 items at once');
  }
  
  // Perform bulk delete
  const deletedCount = ids.length; // Simulate deletion
  
  sendSuccess(res, 200, `Successfully deleted ${deletedCount} items`, {
    deletedCount,
    deletedIds: ids,
  });
});

/**
 * Example: Custom error with specific status code
 */
export const customErrorExample = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const isSomethingWrong = true;
  
  if (isSomethingWrong) {
    // Use sendError for custom status codes
    return sendError(res, 418, "I'm a teapot");
  }
  
  sendSuccess(res, 200, 'All good!');
});

/**
 * Example: Handling validation errors from request body
 */
export const validateAndCreate = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, name } = req.body;
  
  // Collect all validation errors
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }
  
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  // If there are validation errors, send them all at once
  if (errors.length > 0) {
    return sendBadRequest(res, 'Validation failed', { errors });
  }
  
  // Create user
  const newUser = {
    id: Date.now(),
    email,
    name: name.trim(),
    createdAt: new Date(),
  };
  
  sendCreated(res, 'User created successfully', { user: newUser });
});

/**
 * Example: Without asyncHandler (manual error handling)
 * Note: This is NOT recommended. Use asyncHandler instead!
 */
export const manualErrorHandling = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = { id: 1, name: 'Test' };
    sendSuccess(res, 200, undefined, { item });
  } catch (error: any) {
    console.error('Error:', error);
    sendInternalError(res, 'An unexpected error occurred', error);
  }
};

/**
 * Example: With request tracking
 */
export const trackedRequest = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}`;
  
  // Simulate some processing
  const data = { processed: true };
  
  sendSuccess(res, 200, 'Request processed', data, {
    includeMeta: true,
    requestId,
    meta: {
      processingTime: '45ms',
      serverRegion: 'us-east-1',
    },
  });
});

