const express = require('express')
const router = express.Router()
const Vehicle = require('../models/Vehicle')
const Driver = require('../models/Driver')
const Trip = require('../models/Trip')
const FuelLog = require('../models/FuelLog')
const MaintenanceLog = require('../models/MaintenanceLog')
const Expense = require('../models/Expense')

router.post('/populate-data', async (req, res) => {
  try {
    // Get existing data
    const existingVehicles = await Vehicle.find()
    const existingDrivers = await Driver.find()
    
    const results = {
      vehicles: 0,
      drivers: 0,
      trips: 0,
      fuelLogs: 0,
      maintenanceLogs: 0,
      expenses: 0
    }

    // Add more vehicles
    const newVehicles = [
      {
        registrationNumber: 'MH-02-EF-5678',
        model: 'Mahindra Bolero Pickup',
        year: 2021,
        capacity: 1500,
        fuelType: 'Diesel',
        status: 'Available',
        currentLocation: { type: 'Point', coordinates: [72.8777, 19.0760] },
        lastMaintenance: new Date('2024-01-10'),
        insuranceExpiry: new Date('2025-06-30'),
        permitExpiry: new Date('2025-12-31')
      },
      {
        registrationNumber: 'DL-03-GH-9012',
        model: 'Maruti Suzuki Eeco Cargo',
        year: 2022,
        capacity: 600,
        fuelType: 'Petrol',
        status: 'Available',
        currentLocation: { type: 'Point', coordinates: [77.2090, 28.6139] },
        lastMaintenance: new Date('2024-01-05'),
        insuranceExpiry: new Date('2025-08-15'),
        permitExpiry: new Date('2025-11-30')
      },
      {
        registrationNumber: 'KA-04-IJ-3456',
        model: 'Ashok Leyland Dost',
        year: 2020,
        capacity: 1200,
        fuelType: 'Diesel',
        status: 'Maintenance',
        currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
        lastMaintenance: new Date('2024-01-20'),
        insuranceExpiry: new Date('2025-04-20'),
        permitExpiry: new Date('2025-10-15')
      },
      {
        registrationNumber: 'GJ-01-KL-7890',
        model: 'Isuzu D-Max V-Cross',
        year: 2023,
        capacity: 1000,
        fuelType: 'Diesel',
        status: 'Available',
        currentLocation: { type: 'Point', coordinates: [72.5714, 23.0225] },
        lastMaintenance: new Date('2024-01-15'),
        insuranceExpiry: new Date('2025-09-10'),
        permitExpiry: new Date('2026-01-31')
      },
      {
        registrationNumber: 'TN-09-MN-2345',
        model: 'Force Urbania',
        year: 2022,
        capacity: 800,
        fuelType: 'Diesel',
        status: 'Available',
        currentLocation: { type: 'Point', coordinates: [80.2707, 13.0827] },
        lastMaintenance: new Date('2024-01-08'),
        insuranceExpiry: new Date('2025-07-25'),
        permitExpiry: new Date('2025-12-20')
      }
    ]

    const createdVehicles = await Vehicle.insertMany(newVehicles)
    results.vehicles = createdVehicles.length

    // Add more drivers
    const newDrivers = [
      {
        name: 'Suresh Kumar',
        phone: '+91-9876543215',
        email: 'suresh.kumar@fleet.com',
        licenseNumber: 'DL2020987654',
        licenseExpiry: new Date('2028-12-31'),
        status: 'Available',
        safetyScore: 92
      },
      {
        name: 'Anita Desai',
        phone: '+91-9876543216',
        email: 'anita.desai@fleet.com',
        licenseNumber: 'MH2019876543',
        licenseExpiry: new Date('2027-11-30'),
        status: 'Available',
        safetyScore: 88
      },
      {
        name: 'Mohammed Rafiq',
        phone: '+91-9876543217',
        email: 'mohammed.rafiq@fleet.com',
        licenseNumber: 'KA2021765432',
        licenseExpiry: new Date('2029-03-15'),
        status: 'On Trip',
        safetyScore: 95
      },
      {
        name: 'Priya Sharma',
        phone: '+91-9876543218',
        email: 'priya.sharma@fleet.com',
        licenseNumber: 'GJ2020654321',
        licenseExpiry: new Date('2028-08-20'),
        status: 'Available',
        safetyScore: 90
      },
      {
        name: 'Lakshman Reddy',
        phone: '+91-9876543219',
        email: 'lakshman.reddy@fleet.com',
        licenseNumber: 'TN2022543210',
        licenseExpiry: new Date('2030-01-10'),
        status: 'Available',
        safetyScore: 87
      }
    ]

    const createdDrivers = await Driver.insertMany(newDrivers)
    results.drivers = createdDrivers.length

    // Get all vehicles and drivers for trips
    const allVehicles = await Vehicle.find()
    const allDrivers = await Driver.find()

    // Add more trips
    const baseDate = new Date('2024-01-01')
    const newTrips = []

    const origins = ['Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Chennai', 'Pune', 'Hyderabad']
    const destinations = ['Kolkata', 'Jaipur', 'Lucknow', 'Surat', 'Coimbatore', 'Nashik', 'Vizag']

    for (let i = 0; i < 15; i++) {
      const startDate = new Date(baseDate)
      startDate.setDate(startDate.getDate() + i * 2)
      
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1)

      const statuses = ['Completed', 'Completed', 'Completed', 'Dispatched', 'Draft']
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      newTrips.push({
        vehicle: allVehicles[i % allVehicles.length]._id,
        driver: allDrivers[i % allDrivers.length]._id,
        origin: origins[Math.floor(Math.random() * origins.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        startDate: startDate,
        endDate: status === 'Completed' ? endDate : null,
        distance: Math.floor(Math.random() * 800) + 200,
        cargo: `Goods Batch ${1000 + i}`,
        status: status,
        revenue: status === 'Completed' ? Math.floor(Math.random() * 50000) + 30000 : null
      })
    }

    const createdTrips = await Trip.insertMany(newTrips)
    results.trips = createdTrips.length

    // Add more fuel logs
    const completedTrips = await Trip.find({ status: 'Completed' }).limit(20)
    const newFuelLogs = []

    for (const trip of completedTrips) {
      const fuelLiters = Math.floor(Math.random() * 80) + 40
      const fuelCost = fuelLiters * (Math.random() * 10 + 95)

      newFuelLogs.push({
        trip: trip._id,
        vehicle: trip.vehicle,
        date: trip.endDate || new Date(),
        liters: fuelLiters,
        fuelCost: parseFloat(fuelCost.toFixed(2)),
        location: trip.destination
      })
    }

    const createdFuelLogs = await FuelLog.insertMany(newFuelLogs)
    results.fuelLogs = createdFuelLogs.length

    // Add more maintenance logs
    const maintenanceVehicles = allVehicles.slice(0, 8)
    const newMaintenanceLogs = []

    const maintenanceTypes = ['Engine Service', 'Tire Replacement', 'Brake Service', 'Oil Change', 'Battery Replacement', 'AC Repair']
    const descriptions = [
      'Routine engine maintenance and oil filter replacement',
      'All four tires replaced due to wear',
      'Front brake pads and rotors serviced',
      'Engine oil and filter changed',
      'Battery replaced with new unit',
      'AC compressor repaired and refrigerant refilled'
    ]

    for (let i = 0; i < Math.min(maintenanceVehicles.length, 8); i++) {
      const typeIndex = i % maintenanceTypes.length
      const serviceDate = new Date('2024-01-01')
      serviceDate.setDate(serviceDate.getDate() + i * 3)

      newMaintenanceLogs.push({
        vehicle: maintenanceVehicles[i]._id,
        serviceType: maintenanceTypes[typeIndex],
        date: serviceDate,
        description: descriptions[typeIndex],
        cost: Math.floor(Math.random() * 15000) + 5000,
        nextServiceDue: new Date(serviceDate.getTime() + 90 * 24 * 60 * 60 * 1000),
        odometerAtService: Math.floor(Math.random() * 50000) + 20000
      })
    }

    const createdMaintenanceLogs = await MaintenanceLog.insertMany(newMaintenanceLogs)
    results.maintenanceLogs = createdMaintenanceLogs.length

    // Add expense records
    const newExpenses = []
    const expenseCategories = ['Fuel', 'Maintenance', 'Insurance', 'Toll', 'Driver Salary', 'Permit Fee']
    const expenseDescriptions = [
      'Monthly fuel expenses',
      'Vehicle maintenance and repairs',
      'Vehicle insurance premium',
      'Toll charges for interstate travel',
      'Monthly driver salaries',
      'Annual permit renewal fees'
    ]

    for (let i = 0; i < 12; i++) {
      const catIndex = i % expenseCategories.length
      const expenseDate = new Date('2024-01-01')
      expenseDate.setDate(expenseDate.getDate() + i * 7)

      newExpenses.push({
        category: expenseCategories[catIndex],
        amount: Math.floor(Math.random() * 20000) + 5000,
        description: expenseDescriptions[catIndex],
        date: expenseDate,
        vehicle: allVehicles[i % allVehicles.length]._id
      })
    }

    const createdExpenses = await Expense.insertMany(newExpenses)
    results.expenses = createdExpenses.length

    // Get totals
    const totals = {
      totalVehicles: await Vehicle.countDocuments(),
      totalDrivers: await Driver.countDocuments(),
      totalTrips: await Trip.countDocuments(),
      totalFuelLogs: await FuelLog.countDocuments(),
      totalMaintenanceLogs: await MaintenanceLog.countDocuments(),
      totalExpenses: await Expense.countDocuments()
    }

    res.json({
      success: true,
      message: 'Data populated successfully',
      added: results,
      totals: totals
    })
  } catch (error) {
    console.error('Error populating data:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

router.post('/populate-financial', async (req, res) => {
  try {
    console.log('🌱 Starting to seed financial data...');

    // Get all vehicles and trips
    const vehicles = await Vehicle.find();
    const trips = await Trip.find();

    if (vehicles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No vehicles found. Please seed vehicles first.'
      });
    }

    // Clear existing financial data
    await FuelLog.deleteMany({});
    await Expense.deleteMany({});
    console.log('🗑️  Cleared existing fuel logs and expenses');

    const today = new Date();

    // Generate fuel logs (linked to completed trips)
    const fuelLogs = [];
    const completedTrips = trips.filter(t => t.status === 'Completed');
    
    if (completedTrips.length > 0) {
      for (const trip of completedTrips) {
        // Create 1-3 fuel logs per trip
        const numFuelLogs = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < numFuelLogs; i++) {
          const liters = Math.floor(Math.random() * 50) + 30; // 30-80 liters
          const costPerLiter = (Math.random() * 0.5 + 1.3).toFixed(2); // $1.30-$1.80 per liter
          const fuelCost = (liters * costPerLiter).toFixed(2);
          
          fuelLogs.push({
            trip: trip._id,
            vehicle: trip.vehicle,
            date: trip.startDate || new Date(),
            liters,
            fuelCost: parseFloat(fuelCost),
            costPerLiter: parseFloat(costPerLiter),
            odometer: Math.floor(Math.random() * 50000) + 10000,
            location: ['Shell Station', 'BP', 'Chevron', 'Exxon', 'Total'][Math.floor(Math.random() * 5)]
          });
        }
      }
      
      // Also create some fuel logs for recent dates (last 30 days) for active vehicles
      for (let i = 0; i < 15; i++) {
        const randomTrip = completedTrips[Math.floor(Math.random() * completedTrips.length)];
        const date = new Date(today);
        date.setDate(date.getDate() - i * 2);
        
        const liters = Math.floor(Math.random() * 50) + 30;
        const costPerLiter = (Math.random() * 0.5 + 1.3).toFixed(2);
        const fuelCost = (liters * costPerLiter).toFixed(2);
        
        fuelLogs.push({
          trip: randomTrip._id,
          vehicle: randomTrip.vehicle,
          date,
          liters,
          fuelCost: parseFloat(fuelCost),
          costPerLiter: parseFloat(costPerLiter),
          odometer: Math.floor(Math.random() * 50000) + 10000,
          location: ['Shell Station', 'BP', 'Chevron', 'Exxon', 'Total'][Math.floor(Math.random() * 5)]
        });
      }
    }

    const createdFuelLogs = await FuelLog.insertMany(fuelLogs);
    console.log(`✓ Created ${createdFuelLogs.length} fuel logs`);

    // Update vehicle totalFuelCost
    for (const vehicle of vehicles) {
      const vehicleFuelLogs = createdFuelLogs.filter(
        log => log.vehicle.toString() === vehicle._id.toString()
      );
      const totalFuelCost = vehicleFuelLogs.reduce((sum, log) => sum + log.fuelCost, 0);
      await Vehicle.findByIdAndUpdate(vehicle._id, { totalFuelCost });
    }
    console.log('✓ Updated vehicle fuel costs');

    // Generate expenses (last 60 days)
    const expenses = [];
    const expenseCategories = ['Fuel', 'Maintenance', 'Insurance', 'License', 'Salary', 'Parking', 'Toll', 'Other'];
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random 1-3 expenses per day
      const numExpenses = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numExpenses; j++) {
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        let amount;
        let description;
        let vehicle = null;
        
        switch(category) {
          case 'Fuel':
            vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]._id;
            amount = Math.floor(Math.random() * 3000) + 1000; // $1000-$4000
            description = 'Monthly fuel expense';
            break;
          case 'Maintenance':
            vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]._id;
            amount = Math.floor(Math.random() * 2000) + 500; // $500-$2500
            description = ['Oil change', 'Tire replacement', 'Brake service', 'Engine repair'][Math.floor(Math.random() * 4)];
            break;
          case 'Insurance':
            vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]._id;
            amount = Math.floor(Math.random() * 1500) + 500; // $500-$2000
            description = 'Vehicle insurance premium';
            break;
          case 'Salary':
            amount = Math.floor(Math.random() * 3000) + 2000; // $2000-$5000
            description = 'Driver salary payment';
            break;
          case 'Parking':
            amount = Math.floor(Math.random() * 100) + 20; // $20-$120
            description = 'Parking fees';
            break;
          case 'Toll':
            amount = Math.floor(Math.random() * 50) + 10; // $10-$60
            description = 'Highway toll charges';
            break;
          default:
            amount = Math.floor(Math.random() * 500) + 100; // $100-$600
            description = 'Miscellaneous expense';
        }
        
        expenses.push({
          category,
          amount,
          description,
          date,
          vehicle,
          paidBy: 'Company Account',
          paymentMethod: ['Cash', 'Card', 'Bank Transfer'][Math.floor(Math.random() * 3)]
        });
      }
    }

    const createdExpenses = await Expense.insertMany(expenses);
    console.log(`✓ Created ${createdExpenses.length} expenses`);

    // Update trips with revenue (for completed trips)
    const completedTripsForRevenue = trips.filter(t => t.status === 'Completed');
    
    for (const trip of completedTripsForRevenue) {
      const revenue = Math.floor(trip.distance * (Math.random() * 3 + 2)); // $2-$5 per km
      await Trip.findByIdAndUpdate(trip._id, { revenue });
    }
    console.log(`✓ Updated ${completedTripsForRevenue.length} trip revenues`);

    // Update vehicle totalRevenue
    for (const vehicle of vehicles) {
      const vehicleTrips = await Trip.find({ 
        vehicle: vehicle._id, 
        status: 'Completed' 
      });
      const totalRevenue = vehicleTrips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);
      await Vehicle.findByIdAndUpdate(vehicle._id, { totalRevenue });
    }
    console.log('✓ Updated vehicle revenues');

    // Calculate summary
    const totalFuelCost = createdFuelLogs.reduce((sum, log) => sum + log.fuelCost, 0);
    const totalExpenses = createdExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const allCompletedTrips = await Trip.find({ status: 'Completed' });
    const totalRevenue = allCompletedTrips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);
    
    res.json({
      success: true,
      message: 'Financial data populated successfully!',
      summary: {
        fuelLogs: createdFuelLogs.length,
        totalFuelCost: totalFuelCost.toFixed(2),
        expenses: createdExpenses.length,
        totalExpenses: totalExpenses.toFixed(2),
        tripsUpdated: completedTripsForRevenue.length,
        totalRevenue: totalRevenue.toFixed(2),
        netProfit: (totalRevenue - totalExpenses).toFixed(2)
      }
    });
    
  } catch (error) {
    console.error('❌ Error seeding financial data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update Vehicle Capacities
 * POST /api/admin/update-capacities
 */
router.post('/update-capacities', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    let updated = 0;

    for (const vehicle of vehicles) {
      let capacity = 0;
      
      // Assign capacity based on model keywords
      const model = (vehicle.model || '').toLowerCase();
      
      if (model.includes('truck') || model.includes('ultra') || model.includes('bolero')) {
        capacity = 2000; // Trucks
      } else if (model.includes('sprinter') || model.includes('traveller')) {
        capacity = 1500; // Vans/Sprinters
      } else if (model.includes('carry') || model.includes('ecomet')) {
        capacity = 1200; // Light commercial
      } else {
        capacity = 800; // Default
      }

      await Vehicle.findByIdAndUpdate(vehicle._id, { maxLoadCapacity: capacity });
      updated++;
    }

    res.status(200).json({
      success: true,
      message: `Updated ${updated} vehicles with capacity data`,
      vehiclesUpdated: updated
    });

  } catch (error) {
    console.error('❌ Error updating capacities:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router
