const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const addSampleDataViaAPI = async () => {
  try {
    // Login as manager to get token
    console.log('🔐 Logging in as Fleet Manager...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'manager@fleetflow.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Logged in successfully\n');

    // Add Vehicles
    console.log('🚚 Creating vehicles...');
    const vehicles = [
      {
        name: 'Freightliner Cascadia',
        model: 'Cascadia 2022',
        licensePlate: 'TRK-1001',
        maxLoadCapacity: 25000,
        acquisitionCost: 150000,
        odometer: 45000,
        vehicleType: 'Truck',
        status: 'Available',
        region: 'North',
        fuelEfficiency: 8.5
      },
      {
        name: 'Volvo VNL 760',
        model: 'VNL 760',
        licensePlate: 'TRK-1002',
        maxLoadCapacity: 28000,
        acquisitionCost: 165000,
        odometer: 32000,
        vehicleType: 'Truck',
        status: 'Available',
        region: 'South',
        fuelEfficiency: 9.2
      },
      {
        name: 'Mercedes Sprinter',
        model: 'Sprinter 2500',
        licensePlate: 'VAN-2001',
        maxLoadCapacity: 3500,
        acquisitionCost: 55000,
        odometer: 28000,
        vehicleType: 'Van',
        status: 'Available',
        region: 'East',
        fuelEfficiency: 13.5
      }
    ];

    const createdVehicles = [];
    for (const vehicle of vehicles) {
      const response = await axios.post(`${API_URL}/vehicles`, vehicle, { headers });
      createdVehicles.push(response.data.data);
      console.log(`   ✅ Created: ${vehicle.name}`);
    }

    // Add Drivers
    console.log('\n👨‍✈️ Creating drivers...');
    const drivers = [
      {
        name: 'Robert Johnson',
        licenseNumber: 'DL-12345',
        licenseCategory: 'C',
        licenseExpiryDate: '2027-12-31',
        phone: '+1-555-0101',
        email: 'robert.j@fleetflow.com',
        status: 'On Duty'
      },
      {
        name: 'Maria Garcia',
        licenseNumber: 'DL-12346',
        licenseCategory: 'C',
        licenseExpiryDate: '2027-06-30',
        phone: '+1-555-0102',
        email: 'maria.g@fleetflow.com',
        status: 'On Duty'
      },
      {
        name: 'David Lee',
        licenseNumber: 'DL-12347',
        licenseCategory: 'B',
        licenseExpiryDate: '2027-09-15',
        phone: '+1-555-0103',
        email: 'david.l@fleetflow.com',
        status: 'Off Duty'
      }
    ];

    const createdDrivers = [];
    for (const driver of drivers) {
      const response = await axios.post(`${API_URL}/drivers`, driver, { headers });
      createdDrivers.push(response.data.data);
      console.log(`   ✅ Created: ${driver.name}`);
    }

    // Add Trips
    console.log('\n🗺️ Creating trips...');
    const trips = [
      {
        vehicle: createdVehicles[0]._id,
        driver: createdDrivers[0]._id,
        cargoWeight: 22000,
        source: 'New York, NY',
        destination: 'Boston, MA',
        distance: 215,
        revenue: 2800,
        estimatedDuration: 4.5,
        status: 'Completed'
      },
      {
        vehicle: createdVehicles[1]._id,
        driver: createdDrivers[1]._id,
        cargoWeight: 25000,
        source: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
        distance: 380,
        revenue: 4200,
        estimatedDuration: 7,
        status: 'In Progress'
      }
    ];

    for (const trip of trips) {
      const response = await axios.post(`${API_URL}/trips`, trip, { headers });
      console.log(`   ✅ Created: ${trip.source} → ${trip.destination}`);
    }

    // Add Fuel Logs
    console.log('\n⛽ Creating fuel logs...');
    const fuelLogs = [
      {
        vehicle: createdVehicles[0]._id,
        driver: createdDrivers[0]._id,
        fuelAmount: 85,
        fuelCost: 350,
        odometer: 45320,
        location: 'Shell Station, Newark NJ'
      },
      {
        vehicle: createdVehicles[1]._id,
        driver: createdDrivers[1]._id,
        fuelAmount: 92,
        fuelCost: 385,
        odometer: 32180,
        location: 'Chevron, Bakersfield CA'
      }
    ];

    for (const fuelLog of fuelLogs) {
      const response = await axios.post(`${API_URL}/fuel-logs`, fuelLog, { headers });
      console.log(`   ✅ Created: ${fuelLog.location}`);
    }

    // Add Maintenance Logs
    console.log('\n🔧 Creating maintenance logs...');
    const maintenanceLogs = [
      {
        vehicle: createdVehicles[0]._id,
        maintenanceType: 'Preventive',
        workPerformed: 'Oil change, tire rotation, brake inspection',
        cost: 450,
        odometer: 45000,
        provider: 'FleetCare Services'
      },
      {
        vehicle: createdVehicles[1]._id,
        maintenanceType: 'Repair',
        workPerformed: 'Transmission fluid leak repair',
        cost: 1200,
        odometer: 32000,
        provider: 'Volvo Service Center'
      }
    ];

    for (const maintenanceLog of maintenanceLogs) {
      const response = await axios.post(`${API_URL}/maintenance-logs`, maintenanceLog, { headers });
      console.log(`   ✅ Created: ${maintenanceLog.workPerformed}`);
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${vehicles.length} Vehicles`);
    console.log(`   - ${drivers.length} Drivers`);
    console.log(`   - ${trips.length} Trips`);
    console.log(`   - ${fuelLogs.length} Fuel Logs`);
    console.log(`   - ${maintenanceLogs.length} Maintenance Logs`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
};

addSampleDataViaAPI();
