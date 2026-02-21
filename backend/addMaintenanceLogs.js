const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const MaintenanceLog = require('./models/MaintenanceLog');
const Vehicle = require('./models/Vehicle');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const addMaintenanceLogs = async () => {
  await connectDB();
  try {
    console.log('Fetching vehicles...');
    const vehicles = await Vehicle.find().limit(9);
    
    if (vehicles.length === 0) {
      console.log('No vehicles found!');
      return;
    }

    console.log(`Found ${vehicles.length} vehicles`);

    const serviceTypes = [
      'Oil Change',
      'Tire Rotation',
      'Brake Inspection',
      'General Inspection',
      'Engine Repair',
      'Transmission Service',
      'Battery Replacement',
      'Air Filter Change',
      'Coolant Flush',
      'Suspension Repair'
    ];

    const logs = [];
    
    // Create 5-8 logs per vehicle
    for (const vehicle of vehicles) {
      const numLogs = Math.floor(Math.random() * 4) + 5; // 5 to 8 logs
      
      for (let i = 0; i < numLogs; i++) {
        const daysAgo = Math.floor(Math.random() * 180); // Within last 6 months
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        const cost = Math.floor(Math.random() * 1500) + 100; // $100 to $1600
        
        const log = {
          vehicle: vehicle._id,
          serviceType,
          description: `${serviceType} performed as scheduled maintenance`,
          cost,
          serviceDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          nextServiceDate: new Date(Date.now() + (90 - daysAgo) * 24 * 60 * 60 * 1000),
          status: daysAgo < 30 ? 'Completed' : 'Scheduled'
        };
        
        logs.push(log);
      }
    }

    console.log(`Creating ${logs.length} maintenance logs...`);
    
    // Delete existing logs first
    await MaintenanceLog.deleteMany({});
    console.log('Cleared existing logs');
    
    // Insert new logs
    const created = await MaintenanceLog.insertMany(logs);
    console.log(`✅ Created ${created.length} maintenance logs!`);

    // Update vehicle maintenance costs
    console.log('Updating vehicle maintenance costs...');
    for (const vehicle of vehicles) {
      const vehicleLogs = created.filter(log => log.vehicle.toString() === vehicle._id.toString());
      const totalCost = vehicleLogs.reduce((sum, log) => sum + log.cost, 0);
      
      await Vehicle.findByIdAndUpdate(vehicle._id, {
        totalMaintenanceCost: totalCost
      });
      
      console.log(`  ${vehicle.name}: $${totalCost}`);
    }

    console.log('\n✅ All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addMaintenanceLogs();
