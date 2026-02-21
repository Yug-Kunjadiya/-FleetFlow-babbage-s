const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const Expense = require('../models/Expense');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Trip.deleteMany();
    await FuelLog.deleteMany();
    await MaintenanceLog.deleteMany();
    await Expense.deleteMany();

    console.log('✅ Cleared existing data');

    // ==================== USERS ====================
    const users = await User.create([
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
    ]);

    console.log('✅ Created users');

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

    console.log('✅ Created vehicles');

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
        name: 'Emily Chen',
        licenseNumber: 'DL-12348',
        licenseCategory: 'B',
        licenseExpiryDate: new Date('2026-03-20'),
        safetyScore: 97,
        status: 'Off Duty',
        phone: '+1-555-0104',
        email: 'emily.c@fleetflow.com',
        totalTrips: 92,
        completedTrips: 92,
        lateTrips: 0,
        violations: 0,
        maintenanceIncidents: 0
      },
      {
        name: 'James Wilson',
        licenseNumber: 'DL-12349',
        licenseCategory: 'A',
        licenseExpiryDate: new Date('2025-11-10'),
        safetyScore: 90,
        status: 'On Duty',
        phone: '+1-555-0105',
        email: 'james.w@fleetflow.com',
        totalTrips: 45,
        completedTrips: 44,
        lateTrips: 1,
        violations: 0,
        maintenanceIncidents: 1
      }
    ]);

    console.log('✅ Created drivers');

    // ==================== TRIPS ====================
    const trips = await Trip.create([
      {
        vehicle: vehicles[0]._id,
        driver: drivers[0]._id,
        cargoWeight: 18000,
        source: 'New York',
        destination: 'Boston',
        distance: 350,
        status: 'Completed',
        dispatchedAt: new Date('2024-02-01T08:00:00'),
        completedAt: new Date('2024-02-01T14:30:00'),
        initialOdometer: 44000,
        finalOdometer: 44350,
        costPerKm: 2.5,
        revenue: 1200,
        estimatedDuration: 6,
        actualDuration: 6.5,
        isLate: false,
        createdBy: users[1]._id
      },
      {
        vehicle: vehicles[1]._id,
        driver: drivers[1]._id,
        cargoWeight: 22000,
        source: 'Chicago',
        destination: 'Detroit',
        distance: 450,
        status: 'Dispatched',
        dispatchedAt: new Date('2024-02-15T06:00:00'),
        initialOdometer: 31500,
        estimatedDuration: 7,
        revenue: 1500,
        createdBy: users[1]._id
      },
      {
        vehicle: vehicles[2]._id,
        driver: drivers[2]._id,
        cargoWeight: 2500,
        source: 'San Francisco',
        destination: 'San Jose',
        distance: 80,
        status: 'Completed',
        dispatchedAt: new Date('2024-02-10T10:00:00'),
        completedAt: new Date('2024-02-10T12:30:00'),
        initialOdometer: 27900,
        finalOdometer: 27980,
        costPerKm: 1.8,
        revenue: 380,
        estimatedDuration: 2,
        actualDuration: 2.5,
        isLate: false,
        createdBy: users[1]._id
      },
      {
        vehicle: vehicles[4]._id,
        driver: drivers[4]._id,
        cargoWeight: 80,
        source: 'Downtown',
        destination: 'Airport',
        distance: 25,
        status: 'Completed',
        dispatchedAt: new Date('2024-02-12T14:00:00'),
        completedAt: new Date('2024-02-12T14:45:00'),
        initialOdometer: 11975,
        finalOdometer: 12000,
        costPerKm: 1.2,
        revenue: 50,
        estimatedDuration: 0.5,
        actualDuration: 0.75,
        isLate: false,
        createdBy: users[1]._id
      },
      {
        vehicle: vehicles[0]._id,
        driver: drivers[0]._id,
        cargoWeight: 20000,
        source: 'Los Angeles',
        destination: 'Las Vegas',
        distance: 435,
        status: 'Draft',
        estimatedDuration: 6.5,
        revenue: 1400,
        createdBy: users[1]._id
      }
    ]);

    console.log('✅ Created trips');

    // ==================== FUEL LOGS ====================
    const fuelLogs = await FuelLog.create([
      {
        trip: trips[0]._id,
        vehicle: vehicles[0]._id,
        liters: 42,
        fuelCost: 65,
        maintenanceCost: 0,
        date: new Date('2024-02-01T09:00:00'),
        location: 'New York Fuel Station',
        odometer: 44100,
        isAnomalous: false
      },
      {
        trip: trips[1]._id,
        vehicle: vehicles[1]._id,
        liters: 50,
        fuelCost: 78,
        maintenanceCost: 0,
        date: new Date('2024-02-15T07:00:00'),
        location: 'Chicago Fuel Station',
        odometer: 31550,
        isAnomalous: false
      },
      {
        trip: trips[2]._id,
        vehicle: vehicles[2]._id,
        liters: 8,
        fuelCost: 14,
        maintenanceCost: 0,
        date: new Date('2024-02-10T11:00:00'),
        location: 'SF Fuel Station',
        odometer: 27940,
        isAnomalous: false
      }
    ]);

    console.log('✅ Created fuel logs');

    // ==================== MAINTENANCE LOGS ====================
    const maintenanceLogs = await MaintenanceLog.create([
      {
        vehicle: vehicles[0]._id,
        serviceType: 'Oil Change',
        cost: 350,
        date: new Date('2024-01-15'),
        description: 'Regular oil change and filter replacement',
        performedBy: 'AutoService Center',
        odometerAtService: 44000,
        nextServiceDue: new Date('2024-04-15'),
        partsReplaced: ['Oil Filter', 'Engine Oil']
      },
      {
        vehicle: vehicles[3]._id,
        serviceType: 'Brake Service',
        cost: 850,
        date: new Date('2024-02-10'),
        description: 'Brake pad replacement and rotor resurfacing',
        performedBy: 'Precision Auto',
        odometerAtService: 15000,
        nextServiceDue: new Date('2024-08-10'),
        partsReplaced: ['Brake Pads', 'Brake Fluid']
      },
      {
        vehicle: vehicles[2]._id,
        serviceType: 'General Inspection',
        cost: 180,
        date: new Date('2024-01-20'),
        description: 'Routine inspection and minor adjustments',
        performedBy: 'QuickCheck Auto',
        odometerAtService: 27800
      }
    ]);

    console.log('✅ Created maintenance logs');

    // ==================== EXPENSES ====================
    const expenses = await Expense.create([
      {
        category: 'Fuel',
        amount: 65,
        date: new Date('2024-02-01'),
        description: 'Fuel for NYC-Boston trip',
        vehicle: vehicles[0]._id,
        trip: trips[0]._id,
        receiptNumber: 'FUEL-2024-001',
        paymentMethod: 'Card'
      },
      {
        category: 'Maintenance',
        amount: 850,
        date: new Date('2024-02-10'),
        description: 'Brake service',
        vehicle: vehicles[3]._id,
        receiptNumber: 'MAINT-2024-001',
        paymentMethod: 'Bank Transfer'
      },
      {
        category: 'Insurance',
        amount: 3500,
        date: new Date('2024-02-01'),
        description: 'Monthly fleet insurance premium',
        receiptNumber: 'INS-2024-02',
        paymentMethod: 'Bank Transfer'
      },
      {
        category: 'Toll',
        amount: 45,
        date: new Date('2024-02-01'),
        description: 'Highway tolls NYC-Boston',
        vehicle: vehicles[0]._id,
        trip: trips[0]._id,
        receiptNumber: 'TOLL-2024-001',
        paymentMethod: 'Cash'
      }
    ]);

    console.log('✅ Created expenses');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Sample Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Fleet Manager:');
    console.log('  Email: manager@fleetflow.com');
    console.log('  Password: password123');
    console.log('\nDispatcher:');
    console.log('  Email: dispatcher@fleetflow.com');
    console.log('  Password: password123');
    console.log('\nSafety Officer:');
    console.log('  Email: safety@fleetflow.com');
    console.log('  Password: password123');
    console.log('\nFinancial Analyst:');
    console.log('  Email: finance@fleetflow.com');
    console.log('  Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
