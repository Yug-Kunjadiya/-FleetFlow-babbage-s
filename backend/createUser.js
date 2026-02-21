require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const existingUser = await User.findOne({ email: 'manager@fleetflow.com' });
    
    if (existingUser) {
      console.log('✅ User already exists!');
      console.log('Email: manager@fleetflow.com');
      console.log('Password: password123');
      process.exit(0);
    }

    // Create test user
    const user = await User.create({
      name: 'Fleet Manager',
      email: 'manager@fleetflow.com',
      password: 'password123',
      role: 'Fleet Manager'
    });

    console.log('✅ Test user created successfully!');
    console.log('Email:', user.email);
    console.log('Password: password123');
    console.log('Role:', user.role);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUser();
