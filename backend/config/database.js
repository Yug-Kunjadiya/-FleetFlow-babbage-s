const mongoose = require('mongoose');

// Ensure TLS bypass is set before any connection attempt
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let retryCount = 0;
const MAX_RETRIES = 20;

/**
 * Connect to MongoDB database with persistent auto-retry
 */
const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    retryWrites: true,
    // Let the driver handle TLS based on the URI scheme
  };

  const tryConnect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      retryCount = 0;
      await seedDefaultUsers();
      return conn;
    } catch (error) {
      retryCount++;
      console.error(`❌ MongoDB attempt ${retryCount} failed: ${error.message.substring(0, 120)}`);
      if (retryCount < MAX_RETRIES) {
        const delay = Math.min(5000 * retryCount, 30000); // exponential backoff, max 30s
        console.log(`⏳ Retrying in ${delay / 1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(tryConnect, delay);
      } else {
        console.error('❌ Max retries reached. Check MongoDB URI and network.');
      }
      return null;
    }
  };

  return tryConnect();
};

/**
 * Seed default users for testing
 */
const seedDefaultUsers = async () => {
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('📝 Seeding default users...');
      
      const defaultUsers = [
        {
          name: 'Fleet Manager',
          email: 'manager@fleetflow.com',
          password: 'password123',
          role: 'Fleet Manager'
        },
        {
          name: 'Dispatcher',
          email: 'dispatcher@fleetflow.com',
          password: 'password123',
          role: 'Dispatcher'
        },
        {
          name: 'Safety Officer',
          email: 'safety@fleetflow.com',
          password: 'password123',
          role: 'Safety Officer'
        },
        {
          name: 'Financial Analyst',
          email: 'financial@fleetflow.com',
          password: 'password123',
          role: 'Financial Analyst'
        }
      ];
      
      await User.insertMany(defaultUsers);
      console.log('✅ Default users created successfully');
    }
  } catch (error) {
    console.log('ℹ️  Users may already exist or will be created later');
  }
};

module.exports = connectDB;
