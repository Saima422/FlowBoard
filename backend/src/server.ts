import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { initializeKeyPair } from './utils/crypto';
import authRoutes from './routes/auth.routes';
import boardRoutes from './routes/board.routes';
import listRoutes from './routes/list.routes';
import taskRoutes from './routes/task.routes';

// Load environment variables
dotenv.config();

// Generate RSA key pair for credential encryption
initializeKeyPair();

// Create Express app
const app: Application = express();

// Middleware
// Only use helmet in non-Lambda environments
if (process.env.AWS_EXECUTION_ENV === undefined) {
  app.use(helmet());
}

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN ?? "";

const corsOptions: cors.CorsOptions = {
  origin: corsOrigin === '*' 
    ? '*'  // Allow all origins (no credentials)
    : corsOrigin.split(',').map(o => o.trim()), // Support comma-separated origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Only enable credentials if a specific origin is set (not wildcard)
  credentials: corsOrigin !== '*',
};

app.use(cors(corsOptions));

// Explicitly handle preflight requests for Lambda
app.options('*', cors(corsOptions));

// Only use morgan in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export app for Lambda
export { app };

// Only start server if running directly (not in Lambda)
if (require.main === module) {
  startServer();
}

