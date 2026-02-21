require('dotenv').config()
const mongoose = require('mongoose')
const Vehicle = require('./models/Vehicle')
const Driver = require('./models/Driver')
const Trip = require('./models/Trip')
const FuelLog = require('./models/FuelLog')
const MaintenanceLog = require('./models/MaintenanceLog')
const Expense = require('./models/Expense')

const connectDB = async () => {
  try {
    // Use the same connection string format as the main app
    const uri = process.env.MONGO_URI
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    throw err
  }
}

connectDB().then(() => addMoreData()).catch(err => {
  console.error('Failed to run:', err)
  process.exit(1)
})

async function addMoreData() {
  try {
    // Get existing data
    const existingVehicles = await Vehicle.find()
    const existingDrivers = await Driver.find()
    
    console.log(`Found ${existingVehicles.length} existing vehicles`)
    console.log(`Found ${existingDrivers.length} existing drivers`)

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
    console.log(`✓ Added ${createdVehicles.length} new vehicles`)

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
    console.log(`✓ Added ${createdDrivers.length} new drivers`)

    // Get all vehicles and drivers for trips
    const allVehicles = await Vehicle.find()
    const allDrivers = await Driver.find()

    // Add more trips
    const baseDate = new Date('2024-01-01')
    const newTrips = []

    for (let i = 0; i < 15; i++) {
      const startDate = new Date(baseDate)
      startDate.setDate(startDate.getDate() + i * 2)
      
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1)

      const statuses = ['Completed', 'Completed', 'Completed', 'Dispatched', 'Draft']
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      const origins = ['Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Chennai', 'Pune', 'Hyderabad']
      const destinations = ['Kolkata', 'Jaipur', 'Lucknow', 'Surat', 'Coimbatore', 'Nashik', 'Vizag']

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
    console.log(`✓ Added ${createdTrips.length} new trips`)

    // Add more fuel logs
    const completedTrips = await Trip.find({ status: 'Completed' }).limit(20)
    const newFuelLogs = []

    for (const trip of completedTrips) {
      const fuelLiters = Math.floor(Math.random() * 80) + 40
      const fuelCost = fuelLiters * (Math.random() * 10 + 95) // Rs 95-105 per liter

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
    console.log(`✓ Added ${createdFuelLogs.length} new fuel logs`)

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

    for (let i = 0; i < maintenanceVehicles.length; i++) {
      const typeIndex = i % maintenanceTypes.length
      const serviceDate = new Date('2024-01-01')
      serviceDate.setDate(serviceDate.getDate() + i * 3)

      newMaintenanceLogs.push({
        vehicle: maintenanceVehicles[i]._id,
        serviceType: maintenanceTypes[typeIndex],
        date: serviceDate,
        description: descriptions[typeIndex],
        cost: Math.floor(Math.random() * 15000) + 5000,
        nextServiceDue: new Date(serviceDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days later
        odometerAtService: Math.floor(Math.random() * 50000) + 20000
      })
    }

    const createdMaintenanceLogs = await MaintenanceLog.insertMany(newMaintenanceLogs)
    console.log(`✓ Added ${createdMaintenanceLogs.length} new maintenance logs`)

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
    console.log(`✓ Added ${createdExpenses.length} new expense records`)

    console.log('\n=== Data Summary ===')
    console.log(`Total Vehicles: ${allVehicles.length}`)
    console.log(`Total Drivers: ${allDrivers.length}`)
    console.log(`Total Trips: ${await Trip.countDocuments()}`)
    console.log(`Total Fuel Logs: ${await FuelLog.countDocuments()}`)
    console.log(`Total Maintenance Logs: ${await MaintenanceLog.countDocuments()}`)
    console.log(`Total Expenses: ${await Expense.countDocuments()}`)

    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
    process.exit(0)
  } catch (error) {
    console.error('Error adding data:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}
