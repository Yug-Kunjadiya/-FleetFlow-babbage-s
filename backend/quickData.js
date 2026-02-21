require('dotenv').config()
const mongoose = require('mongoose')
const Vehicle = require('./models/Vehicle')
const Driver = require('./models/Driver')
const Trip = require('./models/Trip')

// Direct connection with the exact same format as server.js
const uri = 'mongodb+srv://fleetuser:Yug%4027125@cluster0.xzjj78i.mongodb.net/fleetflow?retryWrites=true&w=majority&appName=Cluster0&tls=true'

async function addQuickData() {
  try {
    await mongoose.connect(uri)
    console.log('✓ Connected to MongoDB')

    // Add 3 more vehicles - Quick approach
    const vehicles = await Vehicle.insertMany([
      {
        registrationNumber: 'MH-02-EF-5678',
        model: 'Mahindra Bolero',
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
        model: 'Eeco Cargo',
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
        model: 'Ashok Leyland',
        year: 2020,
        capacity: 1200,
        fuelType: 'Diesel',
        status: 'Maintenance',
        currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
        lastMaintenance: new Date('2024-01-20'),
        insuranceExpiry: new Date('2025-04-20'),
        permitExpiry: new Date('2025-10-15')
      }
    ])
    console.log(`✓ Added ${vehicles.length} vehicles`)

    // Add 3 more drivers
    const drivers = await Driver.insertMany([
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
        status: 'Available',
        safetyScore: 95
      }
    ])
    console.log(`✓ Added ${drivers.length} drivers`)

    // Get all vehicles and drivers
    const allVehicles = await Vehicle.find()
    const allDrivers = await Driver.find()

    // Add 10 more trips
    const tripData = []
    for (let i = 0; i < 10; i++) {
      const startDate = new Date('2024-01-01')
      startDate.setDate(startDate.getDate() + i * 2)
      
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 2)

      const status = i < 7 ? 'Completed' : (i < 9 ? 'Dispatched' : 'Draft')

      tripData.push({
        vehicle: allVehicles[i % allVehicles.length]._id,
        driver: allDrivers[i % allDrivers.length]._id,
        origin: ['Mumbai', 'Delhi', 'Bangalore'][i % 3],
        destination: ['Kolkata', 'Jaipur', 'Chennai'][i % 3],
        startDate: startDate,
        endDate: status === 'Completed' ? endDate : null,
        distance: 400 + (i * 50),
        cargo: `Cargo ${1000 + i}`,
        status: status,
        revenue: status === 'Completed' ? 35000 + (i * 2000) : null
      })
    }

    const trips = await Trip.insertMany(tripData)
    console.log(`✓ Added ${trips.length} trips`)

    // Summary
    console.log('\n=== TOTALS ===')
    console.log(`Vehicles: ${await Vehicle.countDocuments()}`)
    console.log(`Drivers: ${await Driver.countDocuments()}`)
    console.log(`Trips: ${await Trip.countDocuments()}`)

    await mongoose.connection.close()
    console.log('\n✓ Done!')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    await mongoose.connection.close()
    process.exit(1)
  }
}

addQuickData()
