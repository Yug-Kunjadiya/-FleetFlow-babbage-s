const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const resetAndAddData = async () => {
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
    const driversRes = await axios.get(`${API_URL}/drivers`, { headers });
    const tripsRes = await axios.get(`${API_URL}/trips`, { headers });
    const fuelLogsRes = await axios.get(`${API_URL}/fuel-logs`, { headers });
    const maintenanceLogsRes = await axios.get(`${API_URL}/maintenance-logs`, { headers });
    
    const vehicles = vehiclesRes.data.data;
    const drivers = driversRes.data.data;

    // Delete existing trips, fuel logs, and maintenance logs
    console.log('🧹 Clearing old data...');
    for (const trip of tripsRes.data.data) {
      await axios.delete(`${API_URL}/trips/${trip._id}`, { headers });
    }
    for (const fuelLog of fuelLogsRes.data.data) {
      await axios.delete(`${API_URL}/fuel-logs/${fuelLog._id}`, { headers });
    }
    for (const maintenanceLog of maintenanceLogsRes.data.data) {
      await axios.delete(`${API_URL}/maintenance-logs/${maintenanceLog._id}`, { headers });
    }
    console.log('✅ Cleared old data\n');

    // Reset all vehicles to Available
    console.log('🔄 Resetting vehicle statuses...');
    for (const vehicle of vehicles) {
      await axios.put(`${API_URL}/vehicles/${vehicle._id}`, {
        status: 'Available'
      }, { headers });
    }
    console.log('✅ All vehicles set to Available\n');

    // Sort vehicles by capacity
    vehicles.sort((a, b) => b.maxLoadCapacity - a.maxLoadCapacity);

    // Add Trips
    console.log('🗺️ Creating trips...');
    const tripsData = [
      {
        vehicle: vehicles[0]._id,
        driver: drivers[0]._id,
        cargoWeight: 22000,
        source: 'New York, NY',
        destination: 'Boston, MA',
        distance: 215,
        revenue: 2800,
        estimatedDuration: 4.5,
        status: 'Completed'
      },
      {
        vehicle: vehicles[1]._id,
        driver: drivers[1]._id,
        cargoWeight: 18000,
        source: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
        distance: 380,
        revenue: 4200,
        estimatedDuration: 7,
        status: 'Dispatched'
      },
      {
        vehicle: vehicles[2]._id,
        driver: drivers[2]._id,
        cargoWeight: 2800,
        source: 'Miami, FL',
        destination: 'Orlando, FL',
        distance: 235,
        revenue: 1800,
        estimatedDuration: 4,
        status: 'Draft'
      }
    ];

    const createdTrips = [];
    for (const trip of tripsData) {
      const response = await axios.post(`${API_URL}/trips`, trip, { headers });
      createdTrips.push(response.data.data);
      console.log(`   ✅ ${trip.status}: ${trip.source} → ${trip.destination}`);
    }

    // Add Fuel Logs
    console.log('\n⛽ Creating fuel logs...');
    const fuelLogs = [
      {
        trip: createdTrips[0]._id,
        vehicle: vehicles[0]._id,
        liters: 320,
        fuelCost: 350,
        odometer: 45320,
        location: 'Shell Station, Newark NJ'
      },
      {
        trip: createdTrips[1]._id,
        vehicle: vehicles[1]._id,
        liters: 350,
        fuelCost: 385,
        odometer: 32180,
        location: 'Chevron, Bakersfield CA'
      },
      {
        trip: createdTrips[2]._id,
        vehicle: vehicles[2]._id,
        liters: 170,
        fuelCost: 175,
        odometer: 28150,
        location: 'BP Station, Tampa FL'
      }
    ];

    for (const fuelLog of fuelLogs) {
      await axios.post(`${API_URL}/fuel-logs`, fuelLog, { headers });
      console.log(`   ✅ ${fuelLog.location} - ${fuelLog.liters} liters`);
    }

    // Add Maintenance Logs
    console.log('\n🔧 Creating maintenance logs...');
    const maintenanceLogs = [
      {
        vehicle: vehicles[0]._id,
        maintenanceType: 'Preventive',
        workPerformed: 'Oil change, tire rotation, brake inspection',
        cost: 450,
        odometer: 45000,
        provider: 'FleetCare Services'
      },
      {
        vehicle: vehicles[1]._id,
        maintenanceType: 'Repair',
        workPerformed: 'Transmission fluid leak repair',
        cost: 1200,
        odometer: 32000,
        provider: 'Volvo Service Center'
      },
      {
        vehicle: vehicles[2]._id,
        maintenanceType: 'Preventive',
        workPerformed: 'General inspection and tire check',
        cost: 280,
        odometer: 28000,
        provider: 'Mercedes Service'
      }
    ];

    for (const maintenanceLog of maintenanceLogs) {
      await axios.post(`${API_URL}/maintenance-logs`, maintenanceLog, { headers });
      console.log(`   ✅ ${maintenanceLog.maintenanceType}: ${maintenanceLog.workPerformed.substring(0, 40)}...`);
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log('\n📊 Total Data:');
    console.log(`   - ${vehicles.length} Vehicles`);
    console.log(`   - ${drivers.length} Drivers`);
    console.log(`   - ${createdTrips.length} Trips`);
    console.log(`   - ${fuelLogs.length} Fuel Logs`);
    console.log(`   - ${maintenanceLogs.length} Maintenance Logs`);
    console.log('\n🌐 Visit http://localhost:5173 to see the data!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
};

resetAndAddData();
