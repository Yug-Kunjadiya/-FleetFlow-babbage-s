const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAllUsers = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');

    const users = [
      {
        name: 'John Manager',
        email: 'manager@fleetflow.com',
        password: 'password123',
        role: 'Fleet Manager'
      },
      {
        name: 'Sarah Dispatcher',
        email: 'dispatcher@fleetflow.com',
        password: 'password123',
        role: 'Dispatcher'
      },
      {
        name: 'Mike Safety',
        email: 'safety@fleetflow.com',
        password: 'password123',
        role: 'Safety Officer'
      },
      {
        name: 'Anna Finance',
        email: 'financial@fleetflow.com',
        password: 'password123',
        role: 'Financial Analyst'
      }
    ];

    console.log('👥 Creating users...');

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`✅ User already exists! Email: ${userData.email}`);
      } else {
        const user = await User.create(userData);
        console.log(`✅ Created new user! Email: ${user.email} | Role: ${user.role}`);
      }
    }

    console.log('\n🎉 All users ready!');
    console.log('\nLogin credentials for all users:');
    console.log('Password: password123\n');
    console.log('1. Fleet Manager: manager@fleetflow.com');
    console.log('2. Dispatcher: dispatcher@fleetflow.com');
    console.log('3. Safety Officer: safety@fleetflow.com');
    console.log('4. Financial Analyst: financial@fleetflow.com');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAllUsers();
