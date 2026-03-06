import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboration-board';
    
    // Connection options for security and performance
    await mongoose.connect(mongoUri, {
      // TLS/SSL is enforced by default in MongoDB Atlas connection strings
      // These options provide additional security for self-hosted MongoDB
      maxPoolSize: 10, // Limit connections for Lambda
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`🔒 Connection encrypted: ${mongoose.connection.host?.includes('mongodb.net') ? 'Yes (Atlas TLS)' : 'Check your connection string'}`);
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error; // Changed from process.exit(1)
  }
};

