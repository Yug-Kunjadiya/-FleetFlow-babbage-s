const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const addFuelAndMaintenance = async () => {
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'manager@fleetflow.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    console.log('🔐 Logged in\n');

    // Get existing data
    const vehiclesRes = await axios.get(`${API_URL}/vehicles`, { headers });
    const tripsRes = await axios.get(`${API_URL}/trips`, { headers });
    
    const vehicles = vehiclesRes.data.data;
    const trips = tripsRes.data.data;

    console.log(`Found: ${vehicles.length} vehicles, ${trips.length} trips\n`);

    // Add Fuel Logs (only if trips exist)
    if (trips.length > 0) {
      console.log('⛽ Creating fuel logs...');
      const fuelLogsData = [];

      // Create fuel logs for available trips
      for (let i = 0; i < Math.min(3, trips.length); i++) {
        fuelLogsData.push({
          trip: trips[i]._id,
          vehicle: trips[i].vehicle,
          liters: 300 + (i * 50),
          fuelCost: 300 + (i * 50),
          odometer: 30000 + (i * 10000),
          location: `Fuel Station ${i + 1}`
        });
      }

      for (const fuelLog of fuelLogsData) {
        try {
          await axios.post(`${API_URL}/fuel-logs`, fuelLog, { headers });
          console.log(`   ✅ ${fuelLog.location} - ${fuelLog.liters} liters`);
        } catch (error) {
          console.log(`   ⚠️  ${fuelLog.location} - Skipped (${error.response?.data?.message})`);
        }
      }
    }

    // Add Maintenance Logs
    console.log('\n🔧 Creating maintenance logs...');
    const maintenanceLogs = [
      {
        vehicle: vehicles[0]._id,
        serviceType: 'Oil Change',
        description: 'Oil change, tire rotation, brake inspection',
        cost: 450,
        odometerAtService: 45000,
        performedBy: 'FleetCare Services'
      },
      {
        vehicle: vehicles[1]._id,
        serviceType: 'Transmission Service',
        description: 'Transmission fluid leak repair',
        cost: 1200,
        odometerAtService: 32000,
        performedBy: 'Volvo Service Center'
      },
      {
        vehicle: vehicles[2]._id,
        serviceType: 'General Inspection',
        description: 'General inspection and tire check',
        cost: 280,
        odometerAtService: 28000,
        performedBy: 'Mercedes Service'
      }
    ];

    for (const maintenanceLog of maintenanceLogs) {
      try {
        await axios.post(`${API_URL}/maintenance-logs`, maintenanceLog, { headers });
        console.log(`   ✅ ${maintenanceLog.serviceType}: ${maintenanceLog.description.substring(0, 30)}...`);
      } catch (error) {
        console.log(`   ⚠️  Skipped (${error.response?.data?.message || error.message})`);
      }
    }

    // Get final counts
    const fuelFinal = await axios.get(`${API_URL}/fuel-logs`, { headers });
    const maintFinal = await axios.get(`${API_URL}/maintenance-logs`, { headers });

    console.log('\n🎉 Data setup complete!');
    console.log('\n📊 Database Summary:');
    console.log(`   - ${vehicles.length} Vehicles`);
    console.log(`   - ${trips.length} Trips`);
    console.log(`   - ${fuelFinal.data.data.length} Fuel Logs`);
    console.log(`   - ${maintFinal.data.data.length} Maintenance Logs`);
    console.log('\n🌐 Visit http://localhost:5173 to see the dashboard!');
    console.log('\n🔐 Login with any of these accounts:');
    console.log('   • manager@fleetflow.com / password123');
    console.log('   • dispatcher@fleetflow.com / password123');
    console.log('   • safety@fleetflow.com / password123');
    console.log('   • financial@fleetflow.com / password123');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
};

addFuelAndMaintenance();
