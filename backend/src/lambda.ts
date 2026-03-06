import serverless from 'serverless-http';
import { app } from './server';
import { connectDatabase } from './config/database';
import { getCorsHeaders } from './utils/response';

// Connect to database once (Lambda will reuse connections across invocations)
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('✓ Using existing database connection');
    return;
  }

  console.log('→ Creating new database connection');
  await connectDatabase();
  isConnected = true;
  console.log('✓ Database connected');
};

// Wrap Express app for Lambda using serverless-http
const serverlessApp = serverless(app, {
  binary: ['image/*', 'application/pdf'],
  request: (request: any, event: any, context: any) => {
    // Optional: Add custom request processing
    request.context = context;
    request.event = event;
  }
});

/**
 * Lambda handler function for API Gateway HTTP API
 * This is the entry point when Lambda is invoked
 * 
 * Handler format in Lambda Console: lambda.handler
 */
export const handler = async (event: any, context: any) => {
  try {
    // Set callbackWaitsForEmptyEventLoop to false to allow Lambda to freeze
    // the container with active connections (keeps MongoDB connection alive)
    context.callbackWaitsForEmptyEventLoop = false;
    
    // Ensure database is connected before processing requests
    await connectToDatabase();
    
    // Process the API Gateway event through Express
    const result = await serverlessApp(event, context);
    
    return result;
  } catch (error) {
    console.error('Lambda handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(),
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      }),
    };
  }
};

