import { Response } from 'express';

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | object;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

/**
 * Response options for customizing the response
 */
export interface ResponseOptions {
  includeTimestamp?: boolean;
  includeMeta?: boolean;
  requestId?: string;
  meta?: Record<string, any>;
}

/**
 * Get CORS headers based on environment
 * Exported for use in Lambda handler and other places
 */
export const getCorsHeaders = () => {
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': corsOrigin === '*' ? '*' : corsOrigin.split(',')[0].trim(),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Only add credentials header if origin is not wildcard
  if (corsOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
};

/**
 * Build meta object for response
 */
const buildMeta = (options?: ResponseOptions) => {
  if (!options?.includeMeta) return undefined;
  
  return {
    timestamp: new Date().toISOString(),
    requestId: options.requestId,
    ...options.meta,
  };
};

/**
 * Send a successful response
 * 
 * @param res - Express Response object
 * @param statusCode - HTTP status code (default: 200)
 * @param message - Success message
 * @param data - Response data
 * @param options - Additional response options
 */
export const sendSuccess = <T = any>(
  res: Response,
  statusCode: number = 200,
  message?: string,
  data?: T,
  options?: ResponseOptions
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: buildMeta(options),
  };

  res
    .status(statusCode)
    .set(getCorsHeaders())
    .json(response);
};

/**
 * Send an error response
 * 
 * @param res - Express Response object
 * @param statusCode - HTTP status code (default: 500)
 * @param message - Error message
 * @param error - Error details (only in development mode)
 * @param options - Additional response options
 */
export const sendError = (
  res: Response,
  statusCode: number = 500,
  message: string = 'An error occurred',
  error?: any,
  options?: ResponseOptions
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let errorDetails: string | object | undefined;
  
  if (isDevelopment && error) {
    // In development, include detailed error information
    if (error instanceof Error) {
      errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else if (typeof error === 'string') {
      errorDetails = error;
    } else {
      errorDetails = JSON.stringify(error);
    }
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: errorDetails,
    meta: buildMeta(options),
  };

  res
    .status(statusCode)
    .set(getCorsHeaders())
    .json(response);
};

/**
 * Send a created (201) response
 */
export const sendCreated = <T = any>(
  res: Response,
  message: string = 'Resource created successfully',
  data?: T,
  options?: ResponseOptions
): void => {
  sendSuccess(res, 201, message, data, options);
};

/**
 * Send a no content (204) response
 */
export const sendNoContent = (res: Response): void => {
  res
    .status(204)
    .set(getCorsHeaders())
    .send();
};

/**
 * Send a bad request (400) error
 */
export const sendBadRequest = (
  res: Response,
  message: string = 'Bad request',
  error?: any,
  options?: ResponseOptions
): void => {
  sendError(res, 400, message, error, options);
};

/**
 * Send an unauthorized (401) error
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized',
  error?: any,
  options?: ResponseOptions
): void => {
  sendError(res, 401, message, error, options);
};

/**
 * Send a forbidden (403) error
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden',
  error?: any,
  options?: ResponseOptions
): void => {
  sendError(res, 403, message, error, options);
};

/**
 * Send a not found (404) error
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found',
  error?: any,
  options?: ResponseOptions
): void => {
  sendError(res, 404, message, error, options);
};

/**
 * Send a conflict (409) error
 */
export const sendConflict = (
  res: Response,
  message: string = 'Resource conflict',
  error?: any,
  options?: ResponseOptions
): void => {
  sendError(res, 409, message, error, options);
};

/**
 * Send an internal server error (500)
 */
export const sendInternalError = (
  res: Response,
  message: string = 'Internal server error',
  error?: any,
  options?: ResponseOptions
): void => {
  sendError(res, 500, message, error, options);
};

/**
 * Wrap async controller functions to catch errors
 * and send standardized error responses
 */
export const asyncHandler = (fn: Function) => {
  return async (req: any, res: Response, next: Function) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      console.error('Controller error:', error);
      sendInternalError(res, 'An unexpected error occurred', error);
    }
  };
};

