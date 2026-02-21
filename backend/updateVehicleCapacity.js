// Add capacity data to vehicles for better AI recommendations
require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');

const MONGODB_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

async function updateVehicleCapacities() {
  try {
    const vehicles = await Vehicle.find({});
    console.log(`\n📊 Found ${vehicles.length} vehicles\n`);

    // Define capacity based on vehicle type/model
    const capacityMap = {
      'Ford Transit': 1500,
      'Mercedes Sprinter': 1800,
      'Toyota Hiace': 1200,
      'Isuzu NPR': 3000,
      'Mitsubishi Fuso': 2500,
      'Nissan Urvan': 1000,
      'Hyundai H350': 1400,
      'Volkswagen Crafter': 1700,
      'Iveco Daily': 2200
    };

    for (const vehicle of vehicles) {
      // Try to find capacity based on model name
      let capacity = 0;
      
      for (const [model, cap] of Object.entries(capacityMap)) {
        if (vehicle.model && vehicle.model.includes(model)) {
          capacity = cap;
          break;
        }
      }

      // If no match, assign based on vehicle type or default
      if (capacity === 0) {
        if (vehicle.model && (vehicle.model.toLowerCase().includes('truck') || vehicle.model.toLowerCase().includes('cargo'))) {
          capacity = 2000; // Default for trucks
        } else if (vehicle.model && vehicle.model.toLowerCase().includes('van')) {
          capacity = 1200; // Default for vans
        } else {
          capacity = 800; // Default for smaller vehicles
        }
      }

      // Update the vehicle
      await Vehicle.findByIdAndUpdate(vehicle._id, { 
        maxLoadCapacity: capacity 
      });

      console.log(`✅ Updated ${vehicle.model} (${vehicle.registrationNumber}) - Capacity: ${capacity}kg`);
    }

    console.log(`\n✨ Successfully updated capacities for ${vehicles.length} vehicles\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating vehicle capacities:', error);
    process.exit(1);
  }
}

updateVehicleCapacities();
