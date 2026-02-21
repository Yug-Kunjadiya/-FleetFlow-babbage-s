const axios = require('axios')

// Login as Fleet Manager (has full access)
async function getAuthToken() {
  const response = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'manager@fleetflow.com',
    password: 'password123'
  })
  return response.data.token
}

async function addExpenseData() {
  try {
    console.log('Getting authentication token...')
    const token = await getAuthToken()
    const headers = { Authorization: `Bearer ${token}` }

    console.log('\n=== Adding Expense Data ===\n')

    // Get vehicles and drivers for references
    const vehiclesRes = await axios.get('http://localhost:5000/api/vehicles', { headers })
    const driversRes = await axios.get('http://localhost:5000/api/drivers', { headers })
    
    const vehicles = vehiclesRes.data.data
    const drivers = driversRes.data.data

    console.log(`Found ${vehicles.length} vehicles and ${drivers.length} drivers`)

    // Add expenses
    const expenses = [
      {
        category: 'Fuel',
        amount: 2500,
        date: new Date('2024-01-15'),
        description: 'Diesel for fleet vehicles',
        vehicle: vehicles[0]?._id,
        paymentMethod: 'Card'
      },
      {
        category: 'Maintenance',
        amount: 1200,
        date: new Date('2024-01-10'),
        description: 'Regular servicing for trucks',
        vehicle: vehicles[1]?._id,
        paymentMethod: 'Card'
      },
      {
        category: 'Insurance',
        amount: 5000,
        date: new Date('2024-01-01'),
        description: 'Monthly insurance premium for fleet',
        paymentMethod: 'Bank Transfer'
      },
      {
        category: 'Salary',
        amount: 15000,
        date: new Date('2024-01-15'),
        description: 'Driver salaries',
        driver: drivers[0]?._id,
        paymentMethod: 'Bank Transfer'
      },
      {
        category: 'Fuel',
        amount: 1800,
        date: new Date('2024-01-20'),
        description: 'Petrol for vans',
        vehicle: vehicles[2]?._id,
        paymentMethod: 'Cash'
      },
      {
        category: 'Maintenance',
        amount: 800,
        date: new Date('2024-01-25'),
        description: 'Tyre replacement',
        vehicle: vehicles[0]?._id,
        paymentMethod: 'Card'
      },
      {
        category: 'Parking',
        amount: 300,
        date: new Date('2024-01-18'),
        description: 'Parking fees for deliveries',
        paymentMethod: 'Cash'
      },
      {
        category: 'Toll',
        amount: 450,
        date: new Date('2024-01-22'),
        description: 'Highway toll charges',
        paymentMethod: 'Cash'
      },
      {
        category: 'License',
        amount: 2000,
        date: new Date('2024-01-05'),
        description: 'License renewal fees',
        driver: drivers[1]?._id,
        paymentMethod: 'Card'
      },
      {
        category: 'Other',
        amount: 600,
        date: new Date('2024-01-28'),
        description: 'Miscellaneous fleet expenses',
        paymentMethod: 'Cash'
      }
    ]

    console.log('Adding expenses...')
    for (const expense of expenses) {
      try {
        await axios.post('http://localhost:5000/api/expenses', expense, { headers })
        console.log(`  ✓ Added: ${expense.category} - ₹${expense.amount}`)
      } catch (error) {
        console.log(`  ✗ Failed: ${expense.category} - ${error.response?.data?.message || error.message}`)
      }
    }

    console.log('\n=== Verifying Analytics Data ===\n')
    
    // Test analytics endpoints
    try {
      const vehicleAnalyticsRes = await axios.get('http://localhost:5000/api/dashboard/vehicle-analytics', { headers })
      console.log(`✓ Vehicle Analytics: ${vehicleAnalyticsRes.data.data.length} vehicles`)
      
      const topDriversRes = await axios.get('http://localhost:5000/api/dashboard/top-drivers', { headers })
      console.log(`✓ Top Drivers: ${topDriversRes.data.data.length} drivers`)
      
      const expenseBreakdownRes = await axios.get('http://localhost:5000/api/dashboard/expense-breakdown', { headers })
      console.log(`✓ Expense Breakdown: ${expenseBreakdownRes.data.data.length} categories`)
      
      const totalExpenses = expenseBreakdownRes.data.data.reduce((sum, cat) => sum + cat.amount, 0)
      console.log(`✓ Total Expenses: ₹${totalExpenses}`)
      
    } catch (error) {
      console.error('Analytics verification failed:', error.response?.data?.message || error.message)
    }

    console.log('\n✓ Expense data added successfully!')
    console.log('\nYou can now test the Analytics page at: http://localhost:5173/analytics')

  } catch (error) {
    console.error('\n✗ Error:', error.response?.data?.message || error.message)
  }
}

addExpenseData()
