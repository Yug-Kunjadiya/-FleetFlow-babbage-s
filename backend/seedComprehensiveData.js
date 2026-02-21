const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const FuelLog = require('./models/FuelLog');
const MaintenanceLog = require('./models/MaintenanceLog');
const Expense = require('./models/Expense');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleetflow');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed data...');
    
    // Clear existing data
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await FuelLog.deleteMany({});
    await MaintenanceLog.deleteMany({});
    await Expense.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create vehicles
    const vehicles = await Vehicle.create([
      {
        name: 'Ford F-150',
        model: 'F-150 XLT',
        licensePlate: 'ABC-123',
        maxLoadCapacity: 1000,
        acquisitionCost: 35000,
        odometer: 15000,
        vehicleType: 'Truck',
        status: 'Available',
        region: 'North',
        fuelEfficiency: 12,
        totalRevenue: 5000,
        totalMaintenanceCost: 800,
        totalFuelCost: 1200
      },
      {
        name: 'Toyota Camry',
        model: 'Camry LE',
        licensePlate: 'XYZ-789',
        maxLoadCapacity: 500,
        acquisitionCost: 25000,
        odometer: 8000,
        vehicleType: 'Van',
        status: 'On Trip',
        region: 'South',
        fuelEfficiency: 15,
        totalRevenue: 3500,
        totalMaintenanceCost: 400,
        totalFuelCost: 600
      },
      {
        name: 'Honda Rebel',
        model: 'Rebel 500',
        licensePlate: 'MNO-456',
        maxLoadCapacity: 100,
        acquisitionCost: 8000,
        odometer: 3000,
        vehicleType: 'Bike',
        status: 'Available',
        region: 'East',
        fuelEfficiency: 25,
        totalRevenue: 2000,
        totalMaintenanceCost: 200,
        totalFuelCost: 150
      }
    ]);
    console.log(`🚗 Created ${vehicles.length} vehicles`);

    // Create drivers
    const drivers = await Driver.create([
      {
        name: 'John Smith',
        licenseNumber: 'DL123456',
        licenseCategory: 'C',
        licenseExpiryDate: new Date('2025-12-31'),
        safetyScore: 95,
        status: 'On Duty',
        phone: '+1234567890',
        email: 'john.smith@email.com',
        totalTrips: 25,
        completedTrips: 23,
        lateTrips: 2,
        violations: 0,
        maintenanceIncidents: 1
      },
      {
        name: 'Sarah Johnson',
        licenseNumber: 'DL789012',
        licenseCategory: 'B',
        licenseExpiryDate: new Date('2025-06-30'),
        safetyScore: 88,
        status: 'On Duty',
        phone: '+0987654321',
        email: 'sarah.j@email.com',
        totalTrips: 18,
        completedTrips: 17,
        lateTrips: 1,
        violations: 0,
        maintenanceIncidents: 0
      },
      {
        name: 'Mike Wilson',
        licenseNumber: 'DL345678',
        licenseCategory: 'A',
        licenseExpiryDate: new Date('2024-12-31'),
        safetyScore: 72,
        status: 'Off Duty',
        phone: '+1122334455',
        email: 'mike.w@email.com',
        totalTrips: 30,
        completedTrips: 26,
        lateTrips: 4,
        violations: 1,
        maintenanceIncidents: 2
      }
    ]);
    console.log(`👨‍✈️ Created ${drivers.length} drivers`);

    // Create trips
    const trips = await Trip.create([
      {
        vehicle: vehicles[0]._id,
        driver: drivers[0]._id,
        origin: 'New York',
        destination: 'Boston',
        distance: 300,
        estimatedDuration: 6,
        status: 'Completed',
        dispatchedAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-15'),
        revenue: 800,
        fuelCost: 120,
        expenses: 50
      },
      {
        vehicle: vehicles[1]._id,
        driver: drivers[1]._id,
        origin: 'Los Angeles',
        destination: 'San Francisco',
        distance: 400,
        estimatedDuration: 8,
        status: 'Completed',
        dispatchedAt: new Date('2024-01-20'),
        completedAt: new Date('2024-01-20'),
        revenue: 1000,
        fuelCost: 150,
        expenses: 75
      },
      {
        vehicle: vehicles[2]._id,
        driver: drivers[2]._id,
        origin: 'Chicago',
        destination: 'Detroit',
        distance: 280,
        estimatedDuration: 5,
        status: 'Dispatched',
        dispatchedAt: new Date(),
        revenue: 600,
        fuelCost: 80,
        expenses: 40
      },
      {
        vehicle: vehicles[0]._id,
        driver: drivers[1]._id,
        origin: 'Miami',
        destination: 'Orlando',
        distance: 250,
        estimatedDuration: 4,
        status: 'Draft',
        revenue: 500,
        estimatedFuelCost: 100
      },
      {
        vehicle: vehicles[1]._id,
        driver: drivers[0]._id,
        origin: 'Seattle',
        destination: 'Portland',
        distance: 175,
        estimatedDuration: 3,
        status: 'Completed',
        dispatchedAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-10'),
        revenue: 450,
        fuelCost: 90,
        expenses: 35
      }
    ]);
    console.log(`🚚 Created ${trips.length} trips`);

    // Create fuel logs
    const fuelLogs = await FuelLog.create([
      {
        vehicle: vehicles[0]._id,
        driver: drivers[0]._id,
        date: new Date('2024-01-15'),
        liters: 60,
        fuelCost: 120,
        odometer: 15000,
        fuelType: 'Gasoline',
        pricePerLiter: 2.00,
        station: 'Shell Station NYC'
      },
      {
        vehicle: vehicles[1]._id,
        driver: drivers[1]._id,
        date: new Date('2024-01-20'),
        liters: 75,
        fuelCost: 150,
        odometer: 8000,
        fuelType: 'Gasoline',
        pricePerLiter: 2.00,
        station: 'Chevron LA'
      },
      {
        vehicle: vehicles[2]._id,
        driver: drivers[2]._id,
        date: new Date('2024-01-25'),
        liters: 20,
        fuelCost: 80,
        odometer: 3000,
        fuelType: 'Gasoline',
        pricePerLiter: 4.00,
        station: 'BP Station Chicago'
      },
      {
        vehicle: vehicles[0]._id,
        driver: drivers[1]._id,
        date: new Date('2024-01-10'),
        liters: 45,
        fuelCost: 90,
        odometer: 14700,
        fuelType: 'Gasoline',
        pricePerLiter: 2.00,
        station: 'Exxon Seattle'
      },
      {
        vehicle: vehicles[1]._id,
        driver: drivers[0]._id,
        date: new Date('2024-01-05'),
        liters: 55,
        fuelCost: 110,
        odometer: 7850,
        fuelType: 'Gasoline',
        pricePerLiter: 2.00,
        station: 'Shell Miami'
      }
    ]);
    console.log(`⛽ Created ${fuelLogs.length} fuel logs`);

    // Create maintenance logs
    const maintenanceLogs = await MaintenanceLog.create([
      {
        vehicle: vehicles[0]._id,
        date: new Date('2024-01-01'),
        type: 'Oil Change',
        description: 'Regular oil change and filter replacement',
        cost: 50,
        odometer: 14500,
        technician: 'Auto Shop NYC',
        nextServiceDate: new Date('2024-04-01'),
        notes: 'Used synthetic oil'
      },
      {
        vehicle: vehicles[1]._id,
        date: new Date('2024-01-10'),
        type: 'Tire Rotation',
        description: 'Rotated all four tires',
        cost: 80,
        odometer: 7800,
        technician: 'Tire Center LA',
        nextServiceDate: new Date('2024-04-10'),
        notes: 'Tires in good condition'
      }
    ]);
    console.log(`🔧 Created ${maintenanceLogs.length} maintenance logs`);

    // Create expenses
    const expenses = await Expense.create([
      {
        category: 'Fuel',
        amount: 120,
        date: new Date('2024-01-15'),
        description: 'Fuel for trip to Boston',
        vehicle: vehicles[0]._id,
        trip: trips[0]._id,
        driver: drivers[0]._id,
        paymentMethod: 'Card'
      },
      {
        category: 'Maintenance',
        amount: 50,
        date: new Date('2024-01-01'),
        description: 'Oil change',
        vehicle: vehicles[0]._id,
        paymentMethod: 'Card'
      },
      {
        category: 'Fuel',
        amount: 150,
        date: new Date('2024-01-20'),
        description: 'Fuel for trip to San Francisco',
        vehicle: vehicles[1]._id,
        trip: trips[1]._id,
        driver: drivers[1]._id,
        paymentMethod: 'Card'
      },
      {
        category: 'Maintenance',
        amount: 80,
        date: new Date('2024-01-10'),
        description: 'Tire rotation',
        vehicle: vehicles[1]._id,
        paymentMethod: 'Cash'
      },
      {
        category: 'Insurance',
        amount: 200,
        date: new Date('2024-01-01'),
        description: 'Monthly insurance premium',
        paymentMethod: 'Bank Transfer'
      },
      {
        category: 'Salary',
        amount: 1500,
        date: new Date('2024-01-15'),
        description: 'Driver salary payment',
        driver: drivers[0]._id,
        paymentMethod: 'Bank Transfer'
      },
      {
        category: 'Parking',
        amount: 25,
        date: new Date('2024-01-15'),
        description: 'Parking fees in Boston',
        trip: trips[0]._id,
        paymentMethod: 'Cash'
      },
      {
        category: 'Toll',
        amount: 15,
        date: new Date('2024-01-20'),
        description: 'Toll fees to San Francisco',
        trip: trips[1]._id,
        paymentMethod: 'Cash'
      }
    ]);
    console.log(`💰 Created ${expenses.length} expenses`);

    console.log('\n✅ Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Vehicles: ${vehicles.length}`);
    console.log(`- Drivers: ${drivers.length}`);
    console.log(`- Trips: ${trips.length}`);
    console.log(`- Fuel Logs: ${fuelLogs.length}`);
    console.log(`- Maintenance Logs: ${maintenanceLogs.length}`);
    console.log(`- Expenses: ${expenses.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

// Run the seeding
connectDB().then(() => {
  seedData();
});
