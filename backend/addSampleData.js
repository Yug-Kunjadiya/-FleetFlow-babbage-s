const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const FuelLog = require('./models/FuelLog');
const MaintenanceLog = require('./models/MaintenanceLog');

dotenv.config();

const addSampleData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Clear existing data (except users)
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Trip.deleteMany();
    await FuelLog.deleteMany();
    await MaintenanceLog.deleteMany();

    console.log('🧹 Cleared existing data (keeping users)');

    // ==================== VEHICLES ====================
    const vehicles = await Vehicle.create([
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
        fuelEfficiency: 8.5,
        lastServiceDate: new Date('2024-01-15'),
        totalRevenue: 85000,
        totalMaintenanceCost: 12000,
        totalFuelCost: 18000
      },
      {
        name: 'Volvo VNL 760',
        model: 'VNL 760',
        licensePlate: 'TRK-1002',
        maxLoadCapacity: 28000,
        acquisitionCost: 165000,
        odometer: 32000,
        vehicleType: 'Truck',
        status: 'On Trip',
        region: 'South',
        fuelEfficiency: 9.2,
        lastServiceDate: new Date('2024-02-01'),
        totalRevenue: 65000,
        totalMaintenanceCost: 8000,
        totalFuelCost: 14000
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
        fuelEfficiency: 13.5,
        lastServiceDate: new Date('2024-01-20'),
        totalRevenue: 42000,
        totalMaintenanceCost: 4500,
        totalFuelCost: 6000
      },
      {
        name: 'Ford Transit',
        model: 'Transit 350',
        licensePlate: 'VAN-2002',
        maxLoadCapacity: 4000,
        acquisitionCost: 48000,
        odometer: 15000,
        vehicleType: 'Van',
        status: 'In Shop',
        region: 'West',
        fuelEfficiency: 12.8,
        lastServiceDate: new Date('2024-02-10'),
        totalRevenue: 28000,
        totalMaintenanceCost: 3000,
        totalFuelCost: 4000
      },
      {
        name: 'Honda CBR Cargo',
        model: 'CBR 500',
        licensePlate: 'BIKE-3001',
        maxLoadCapacity: 150,
        acquisitionCost: 8000,
        odometer: 12000,
        vehicleType: 'Bike',
        status: 'Available',
        region: 'Central',
        fuelEfficiency: 35,
        lastServiceDate: new Date('2024-01-25'),
        totalRevenue: 15000,
        totalMaintenanceCost: 800,
        totalFuelCost: 1200
      }
    ]);

    console.log(`✅ Created ${vehicles.length} vehicles`);

    // ==================== DRIVERS ====================
    const drivers = await Driver.create([
      {
        name: 'Robert Johnson',
        licenseNumber: 'DL-12345',
        licenseCategory: 'C',
        licenseExpiryDate: new Date('2025-12-31'),
        safetyScore: 95,
        status: 'On Duty',
        phone: '+1-555-0101',
        email: 'robert.j@fleetflow.com',
        totalTrips: 120,
        completedTrips: 118,
        lateTrips: 2,
        violations: 0,
        maintenanceIncidents: 1
      },
      {
        name: 'Maria Garcia',
        licenseNumber: 'DL-12346',
        licenseCategory: 'C',
        licenseExpiryDate: new Date('2026-06-30'),
        safetyScore: 88,
        status: 'On Trip',
        phone: '+1-555-0102',
        email: 'maria.g@fleetflow.com',
        totalTrips: 85,
        completedTrips: 82,
        lateTrips: 5,
        violations: 1,
        maintenanceIncidents: 2
      },
      {
        name: 'David Lee',
        licenseNumber: 'DL-12347',
        licenseCategory: 'B',
        licenseExpiryDate: new Date('2025-09-15'),
        safetyScore: 92,
        status: 'On Duty',
        phone: '+1-555-0103',
        email: 'david.l@fleetflow.com',
        totalTrips: 65,
        completedTrips: 64,
        lateTrips: 1,
        violations: 0,
        maintenanceIncidents: 0
      },
      {
        name: 'Jennifer Smith',
        licenseNumber: 'DL-12348',
        licenseCategory: 'C',
        licenseExpiryDate: new Date('2025-11-20'),
        safetyScore: 90,
        status: 'Off Duty',
        phone: '+1-555-0104',
        email: 'jennifer.s@fleetflow.com',
        totalTrips: 98,
        completedTrips: 95,
        lateTrips: 3,
        violations: 0,
        maintenanceIncidents: 2
      }
    ]);

    console.log(`✅ Created ${drivers.length} drivers`);

    // ==================== TRIPS ====================
    const trips = await Trip.create([
      {
        vehicle: vehicles[0]._id,
        driver: drivers[0]._id,
        cargoWeight: 22000,
        source: 'New York, NY',
        destination: 'Boston, MA',
        distance: 215,
        revenue: 2800,
        estimatedDuration: 4.5,
        status: 'Completed',
        startTime: new Date('2024-02-15T08:00:00'),
        endTime: new Date('2024-02-15T12:30:00')
      },
      {
        vehicle: vehicles[1]._id,
        driver: drivers[1]._id,
        cargoWeight: 25000,
        source: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
        distance: 380,
        revenue: 4200,
        estimatedDuration: 7,
        status: 'In Progress',
        startTime: new Date('2024-02-20T06:00:00')
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
        status: 'Completed',
        startTime: new Date('2024-02-18T09:00:00'),
        endTime: new Date('2024-02-18T13:00:00')
      },
      {
        vehicle: vehicles[0]._id,
        driver: drivers[3]._id,
        cargoWeight: 20000,
        source: 'Chicago, IL',
        destination: 'Detroit, MI',
        distance: 280,
        revenue: 3200,
        estimatedDuration: 5.5,
        status: 'Draft'
      }
    ]);

    console.log(`✅ Created ${trips.length} trips`);

    // ==================== FUEL LOGS ====================
    const fuelLogs = await FuelLog.create([
      {
        vehicle: vehicles[0]._id,
        driver: drivers[0]._id,
        fuelAmount: 85,
        fuelCost: 350,
        odometer: 45320,
        location: 'Shell Station, Newark NJ',
        date: new Date('2024-02-16')
      },
      {
        vehicle: vehicles[1]._id,
        driver: drivers[1]._id,
        fuelAmount: 92,
        fuelCost: 385,
        odometer: 32180,
        location: 'Chevron, Bakersfield CA',
        date: new Date('2024-02-20')
      },
      {
        vehicle: vehicles[2]._id,
        driver: drivers[2]._id,
        fuelAmount: 45,
        fuelCost: 175,
        odometer: 28150,
        location: 'BP Station, Tampa FL',
        date: new Date('2024-02-18')
      }
    ]);

    console.log(`✅ Created ${fuelLogs.length} fuel logs`);

    // ==================== MAINTENANCE LOGS ====================
    const maintenanceLogs = await MaintenanceLog.create([
      {
        vehicle: vehicles[0]._id,
        maintenanceType: 'Preventive',
        workPerformed: 'Oil change, tire rotation, brake inspection',
        cost: 450,
        odometer: 45000,
        provider: 'FleetCare Services',
        date: new Date('2024-01-15')
      },
      {
        vehicle: vehicles[1]._id,
        maintenanceType: 'Repair',
        workPerformed: 'Transmission fluid leak repair',
        cost: 1200,
        odometer: 32000,
        provider: 'Volvo Service Center',
        date: new Date('2024-02-01')
      },
      {
        vehicle: vehicles[3]._id,
        maintenanceType: 'Repair',
        workPerformed: 'Engine diagnostics and alternator replacement',
        cost: 850,
        odometer: 15000,
        provider: 'Ford Authorized Service',
        date: new Date('2024-02-10')
      },
      {
        vehicle: vehicles[4]._id,
        maintenanceType: 'Preventive',
        workPerformed: 'Chain lubrication and brake pad replacement',
        cost: 180,
        odometer: 12000,
        provider: 'Two Wheels Garage',
        date: new Date('2024-01-25')
      }
    ]);

    console.log(`✅ Created ${maintenanceLogs.length} maintenance logs`);

    console.log('\n🎉 Sample data added successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${vehicles.length} Vehicles`);
    console.log(`   - ${drivers.length} Drivers`);
    console.log(`   - ${trips.length} Trips`);
    console.log(`   - ${fuelLogs.length} Fuel Logs`);
    console.log(`   - ${maintenanceLogs.length} Maintenance Logs`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addSampleData();
