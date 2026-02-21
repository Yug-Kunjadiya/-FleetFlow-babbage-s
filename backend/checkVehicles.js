// Check vehicle data to debug chatbot issue
require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');

const MONGODB_URI = process.env.MONGO_URI;

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

async function checkVehicles() {
  try {
    const vehicles = await Vehicle.find({});
    console.log(`\n📊 Total vehicles: ${vehicles.length}\n`);

    vehicles.forEach((v, i) => {
      console.log(`${i + 1}. ${v.model}`);
      console.log(`   • Registration: ${v.registrationNumber || 'N/A'}`);
      console.log(`   • Status: ${v.status}`);
      console.log(`   • Capacity: ${v.capacity || 'N/A'}kg`);
      console.log(`   • Available: ${v.status === 'Available' ? 'YES' : 'NO'}`);
      console.log('');
    });

    const available = vehicles.filter(v => v.status === 'Available');
    const withCapacity = vehicles.filter(v => v.capacity && v.capacity > 0);
    const availableWithCapacity = vehicles.filter(v => v.status === 'Available' && v.capacity && v.capacity > 0);

    console.log(`\n📈 Summary:`);
    console.log(`   • Available: ${available.length}`);
    console.log(`   • With Capacity: ${withCapacity.length}`);
    console.log(`   • Available WITH Capacity: ${availableWithCapacity.length}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkVehicles();
