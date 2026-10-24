require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Auto-seed if database is empty for zero-friction evaluation
    await seedDatabase();

    // 3. Start HTTP server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 DevPulse API Server running on port: ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal error during server startup:', error.message);
    process.exit(1);
  }
};

startServer();
