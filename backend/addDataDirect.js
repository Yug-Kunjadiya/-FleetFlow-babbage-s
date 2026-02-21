const mongoose = require('mongoose')

// Connect directly to MongoDB
const uri = 'mongodb+srv://fleetuser:Yug%4027125@cluster0.xzjj78i.mongodb.net/fleetflow?retryWrites=true&w=majority&appName=Cluster0'

// Define schemas inline
const vehicleSchema = new mongoose.Schema({
  registrationNumber: String,
  model: String,
  year: Number,
  capacity: Number,
  fuelType: String,
  status: String,
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  lastMaintenance: Date,
  insuranceExpiry: Date,
  permitExpiry: Date
})

const driverSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  licenseNumber: String,
  licenseExpiry: Date,
  status: String,
  safetyScore: Number
})

const tripSchema = new mongoose.Schema({
  vehicle: mongoose.Schema.Types.ObjectId,
  driver: mongoose.Schema.Types.ObjectId,
  origin: String,
  destination: String,
  startDate: Date,
  endDate: Date,
  distance: Number,
  cargo: String,
  status: String,
  revenue: Number
})

const fuelLogSchema = new mongoose.Schema({
  trip: mongoose.Schema.Types.ObjectId,
  vehicle: mongoose.Schema.Types.ObjectId,
  date: Date,
  liters: Number,
  fuelCost: Number,
  location: String
})

const maintenanceLogSchema = new mongoose.Schema({
  vehicle: mongoose.Schema.Types.ObjectId,
  serviceType: String,
  date: Date,
  description: String,
  cost: Number,
  nextServiceDue: Date,
  odometerAtService: Number
})

async function addData() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(uri)
    console.log('✓ Connected!')

    const Vehicle = mongoose.model('Vehicle', vehicleSchema)
    const Driver = mongoose.model('Driver', driverSchema)
    const Trip = mongoose.model('Trip', tripSchema)
    const FuelLog = mongoose.model('FuelLog', fuelLogSchema)
    const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema)

    // Add vehicles
    const newVehicles = [
      {
        registrationNumber: 'MH-05-XY-1234',
        model: 'Tata Ace',
        year: 2023,
        capacity: 750,
        fuelType: 'Diesel',
        status: 'Available',
        currentLocation: { type: 'Point', coordinates: [72.8777, 19.0760] },
        lastMaintenance: new Date('2024-01-15'),
        insuranceExpiry: new Date('2025-12-31'),
        permitExpiry: new Date('2025-12-31')
      },
      {
        registrationNumber: 'DL-08-AB-5678',
        model: 'Mahindra Pickup',
        year: 2022,
        capacity: 1500,
        fuelType: 'Diesel',
        status: 'Available',
        currentLocation: { type: 'Point', coordinates: [77.2090, 28.6139] },
        lastMaintenance: new Date('2024-01-20'),
        insuranceExpiry: new Date('2025-11-30'),
        permitExpiry: new Date('2025-11-30')
      }
    ]

    console.log('Adding vehicles...')
    const vehicles = await Vehicle.insertMany(newVehicles)
    console.log(`✓ Added ${vehicles.length} vehicles`)

    // Add drivers
    const newDrivers = [
      {
        name: 'Karan Singh',
        phone: '+91-9876543220',
        email: 'karan.singh@fleet.com',
        licenseNumber: 'DL2023111222',
        licenseExpiry: new Date('2028-12-31'),
        status: 'Available',
        safetyScore: 94
      },
      {
        name: 'Meera Patel',
        phone: '+91-9876543221',
        email: 'meera.patel@fleet.com',
        licenseNumber: 'MH2022333444',
        licenseExpiry: new Date('2029-06-30'),
        status: 'Available',
        safetyScore: 91
      }
    ]

    console.log('Adding drivers...')
    const drivers = await Driver.insertMany(newDrivers)
    console.log(`✓ Added ${drivers.length} drivers`)

    // Get all vehicles and drivers
    const allVehicles = await Vehicle.find().limit(5)
    const allDrivers = await Driver.find().limit(5)

    if (allVehicles.length > 0 && allDrivers.length > 0) {
      // Add trips
      const newTrips = []
      for (let i = 0; i < 8; i++) {
        const startDate = new Date('2024-01-15')
        startDate.setDate(startDate.getDate() + i * 3)
        
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 1)

        const status = i < 6 ? 'Completed' : 'Dispatched'

        newTrips.push({
          vehicle: allVehicles[i % allVehicles.length]._id,
          driver: allDrivers[i % allDrivers.length]._id,
          origin: ['Mumbai', 'Delhi', 'Pune', 'Bangalore'][i % 4],
          destination: ['Kolkata', 'Jaipur', 'Chennai', 'Hyderabad'][i % 4],
          startDate: startDate,
          endDate: status === 'Completed' ? endDate : null,
          distance: 300 + (i * 100),
          cargo: `Shipment-${2000 + i}`,
          status: status,
          revenue: status === 'Completed' ? 25000 + (i * 3000) : null
        })
      }

      console.log('Adding trips...')
      const trips = await Trip.insertMany(newTrips)
      console.log(`✓ Added ${trips.length} trips`)

      // Add fuel logs
      const completedTrips = await Trip.find({ status: 'Completed' }).limit(10)
      if (completedTrips.length > 0) {
        const fuelLogs = completedTrips.map(trip => ({
          trip: trip._id,
          vehicle: trip.vehicle,
          date: trip.endDate || new Date(),
          liters: 50 + Math.floor(Math.random() * 40),
          fuelCost: 5000 + Math.floor(Math.random() * 3000),
          location: trip.destination
        }))

        console.log('Adding fuel logs...')
        const createdFuelLogs = await FuelLog.insertMany(fuelLogs)
        console.log(`✓ Added ${createdFuelLogs.length} fuel logs`)
      }

      // Add maintenance logs
      const maintenanceLogs = allVehicles.slice(0, 3).map((vehicle, i) => ({
        vehicle: vehicle._id,
        serviceType: ['Engine Service', 'Tire Replacement', 'Oil Change'][i],
        date: new Date('2024-01-' + (10 + i * 5)),
        description: ['Engine tune-up', 'All tires replaced', 'Oil and filter change'][i],
        cost: 8000 + (i * 2000),
        nextServiceDue: new Date('2024-04-' + (10 + i * 5)),
        odometerAtService: 25000 + (i * 5000)
      }))

      console.log('Adding maintenance logs...')
      const createdMaintenance = await MaintenanceLog.insertMany(maintenanceLogs)
      console.log(`✓ Added ${createdMaintenance.length} maintenance logs`)
    }

    // Summary
    console.log('\n=== DATABASE SUMMARY ===')
    console.log(`Total Vehicles: ${await Vehicle.countDocuments()}`)
    console.log(`Total Drivers: ${await Driver.countDocuments()}`)
    console.log(`Total Trips: ${await Trip.countDocuments()}`)
    console.log(`Total Fuel Logs: ${await FuelLog.countDocuments()}`)
    console.log(`Total Maintenance Logs: ${await MaintenanceLog.countDocuments()}`)

    await mongoose.connection.close()
    console.log('\n✓ Database connection closed')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
    }
    process.exit(1)
  }
}

addData()
