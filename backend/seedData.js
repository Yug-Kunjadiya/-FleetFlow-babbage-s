const axios = require('axios')

// Login as Fleet Manager (has full access)
async function getAuthToken() {
  const response = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'manager@fleetflow.com',
    password: 'password123'
  })
  return response.data.token
}

async function addData() {
  try {
    console.log('Getting authentication token...')
    const token = await getAuthToken()
    const headers = { Authorization: `Bearer ${token}` }

    console.log('\n=== Adding Fleet Data ===\n')

    // Add more vehicles
    const vehicles = [
      {
        name: 'Tata Ultra Heavy',
        model: 'Tata Ultra 1918',
        licensePlate: 'MH-12-XY-7890',
        maxLoadCapacity: 3500,
        acquisitionCost: 2500000,
        vehicleType: 'Truck',
        status: 'Available',
        fuelEfficiency: 8.5
      },
      {
        name: 'Ashok Leyland Cargo',
        model: 'Ashok Leyland Ecomet',
        licensePlate: 'DL-10-PQ-4567',
        maxLoadCapacity: 2500,
        acquisitionCost: 1800000,
        vehicleType: 'Truck',
        status: 'Available',
        fuelEfficiency: 9.2
      },
      {
        name: 'Mahindra Pickup',
        model: 'Mahindra Bolero Maxi Truck',
        licensePlate: 'KA-20-RS-8901',
        maxLoadCapacity: 1500,
        acquisitionCost: 950000,
        vehicleType: 'Truck',
        status: 'Available',
        fuelEfficiency: 12.0
      },
      {
        name: 'Maruti Cargo Van',
        model: 'Maruti Super Carry',
        licensePlate: 'TN-15-TU-2345',
        maxLoadCapacity: 740,
        acquisitionCost: 550000,
        vehicleType: 'Van',
        status: 'Available',
        fuelEfficiency: 15.5
      },
      {
        name: 'Force Passenger',
        model: 'Force Traveller',
        licensePlate: 'GJ-05-VW-6789',
        maxLoadCapacity: 1200,
        acquisitionCost: 1200000,
        vehicleType: 'Van',
        status: 'Available',
        fuelEfficiency: 11.0
      }
    ]

    console.log('Adding vehicles...')
    for (const vehicle of vehicles) {
      try {
        await axios.post('http://localhost:5000/api/vehicles', vehicle, { headers })
        console.log(`  ✓ Added: ${vehicle.licensePlate} (${vehicle.model})`)
      } catch (error) {
        if (error.response?.data?.message?.includes('duplicate')) {
          console.log(`  ⊘ Skipped: ${vehicle.licensePlate} (already exists)`)
        } else {
          console.log(`  ✗ Failed: ${vehicle.licensePlate}`)
        }
      }
    }

    // Add more drivers
    const drivers = [
      {
        name: 'Ramesh Kumar',
        phone: '+91-9988776655',
        email: 'ramesh.kumar@fleet.com',
        licenseNumber: 'DL-2024-001122',
        licenseCategory: 'C',
        licenseExpiryDate: '2030-12-31',
        status: 'Off Duty',
        safetyScore: 93
      },
      {
        name: 'Sunita Verma',
        phone: '+91-9988776656',
        email: 'sunita.verma@fleet.com',
        licenseNumber: 'MH-2023-223344',
        licenseCategory: 'C',
        licenseExpiryDate: '2029-06-30',
        status: 'Off Duty',
        safetyScore: 96
      },
      {
        name: 'Vikram Singh',
        phone: '+91-9988776657',
        email: 'vikram.singh@fleet.com',
        licenseNumber: 'KA-2024-445566',
        licenseCategory: 'D',
        licenseExpiryDate: '2030-03-15',
        status: 'Off Duty',
        safetyScore: 91
      },
      {
        name: 'Priya Nair',
        phone: '+91-9988776658',
        email: 'priya.nair@fleet.com',
        licenseNumber: 'TN-2023-667788',
        licenseCategory: 'B',
        licenseExpiryDate: '2029-09-20',
        status: 'Off Duty',
        safetyScore: 94
      },
      {
        name: 'Amit Patel',
        phone: '+91-9988776659',
        email: 'amit.patel@fleet.com',
        licenseNumber: 'GJ-2024-889900',
        licenseCategory: 'C',
        licenseExpiryDate: '2030-01-10',
        status: 'Off Duty',
        safetyScore: 89
      }
    ]

    console.log('\nAdding drivers...')
    for (const driver of drivers) {
      try {
        await axios.post('http://localhost:5000/api/drivers', driver, { headers })
        console.log(`  ✓ Added: ${driver.name}`)
      } catch (error) {
        if (error.response?.data?.message?.includes('duplicate') || error.response?.data?.message?.includes('exist')) {
          console.log(`  ⊘ Skipped: ${driver.name} (already exists)`)
        } else {
          console.log(`  ✗ Failed: ${driver.name} - ${error.response?.data?.message || error.message}`)
        }
      }
    }

    // Get all vehicles and drivers
    const vehiclesRes = await axios.get('http://localhost:5000/api/vehicles', { headers })
    const driversRes = await axios.get('http://localhost:5000/api/drivers', { headers })
    
    const allVehicles = vehiclesRes.data.data
    const allDrivers = driversRes.data.data

    console.log(`\nAvailable: ${allVehicles.length} vehicles, ${allDrivers.length} drivers`)

    // Add trips
    if (allVehicles.length > 0 && allDrivers.length > 0) {
      console.log('\nAdding trips...')
      
      const sources = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Ahmedabad', 'Kolkata']
      const destinations = ['Jaipur', 'Lucknow', 'Surat', 'Coimbatore', 'Nashik', 'Vizag', 'Indore', 'Bhopal']
      const statuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Dispatched', 'Draft']
      
      for (let i = 0; i < 12; i++) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 20 + i * 2)
        
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 1)

        const status = statuses[i % statuses.length]
        const vehicleIndex = i % allVehicles.length
        
        const trip = {
          vehicle: allVehicles[vehicleIndex]._id,
          driver: allDrivers[i % allDrivers.length]._id,
          source: sources[i % sources.length],
          destination: destinations[i % destinations.length],
          distance: 250 + (i * 75),
          cargoWeight: 500 + (i * 100),
          status: status
        }
        
        if (status === 'Dispatched') {
          trip.dispatchedAt = startDate.toISOString()
        } else if (status === 'Completed') {
          trip.dispatchedAt = startDate.toISOString()
          trip.completedAt = endDate.toISOString()
        }

        try {
          await axios.post('http://localhost:5000/api/trips', trip, { headers })
          console.log(`  ✓ Trip ${i + 1}: ${trip.source} → ${trip.destination} (${status})`)
        } catch (error) {
          console.log(`  ✗ Trip ${i + 1} failed: ${error.response?.data?.message || error.message}`)
        }
      }
    }

    // Final summary
    console.log('\n=== Data Addition Complete ===\n')
    const kpisRes = await axios.get('http://localhost:5000/api/dashboard/kpis', { headers })
    const kpis = kpisRes.data.data
    
    console.log(`✓ Total Vehicles: ${kpis.totalVehicles}`)
    console.log(`✓ Total Drivers: ${kpis.totalDrivers || allDrivers.length}`)
    console.log(`✓ Active Trips: ${kpis.activeTrips}`)
    console.log(`✓ Completed Trips: ${kpis.completedTripsThisMonth || 0}`)
    console.log(`✓ Monthly Revenue: ₹${kpis.monthlyRevenue}`)
    console.log('\n✓ Database populated successfully!')
    console.log('\nYou can now access the application at: http://localhost:5173')

  } catch (error) {
    console.error('\n✗ Error:', error.response?.data?.message || error.message)
  }
}

addData()
