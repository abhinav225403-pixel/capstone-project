const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    const primaryUri = process.env.MONGODB_URI;

    if (primaryUri && primaryUri.trim() !== '') {
      console.log(`[DB] Attempting connection to MongoDB at: ${primaryUri.split('@')[1] || primaryUri}`);
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[DB] Successfully connected to MongoDB Host: ${conn.connection.host}`);
      return conn;
    }

    // If no URI is provided, attempt to use MongoDB Memory Server for seamless local zero-config operation
    console.log('[DB] No MONGODB_URI specified. Initializing embedded MongoDB engine...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[DB] Embedded in-memory MongoDB initialized at: ${inMemoryUri}`);
      return conn;
    } catch (memErr) {
      console.warn('[DB] Embedded MongoMemoryServer unavailable, attempting fallback to local MongoDB instance...', memErr.message);
      const fallbackUri = 'mongodb://127.0.0.1:27017/devpulse';
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[DB] Connected to local MongoDB fallback at ${fallbackUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`[DB Error] Database connection failed: ${error.message}`);
    // Return or throw so the application can log gracefully
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('[DB] Disconnected successfully');
  } catch (err) {
    console.error('[DB Error] Error disconnecting:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
