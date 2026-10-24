require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('./seedData');

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seed runner failed:', err);
    process.exit(1);
  }
};

run();
