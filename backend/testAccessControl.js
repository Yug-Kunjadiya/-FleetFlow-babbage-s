const axios = require('axios')

// Test different user roles
const users = [
  { email: 'dispatcher@fleetflow.com', password: 'password123', role: 'Dispatcher' },
  { email: 'safety@fleetflow.com', password: 'password123', role: 'Safety Officer' },
  { email: 'manager@fleetflow.com', password: 'password123', role: 'Fleet Manager' }
]

async function getAuthToken(user) {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: user.email,
      password: user.password
    })
    return { token: response.data.token, user: response.data.user }
  } catch (error) {
    console.error(`❌ Login failed for ${user.email}:`, error.response?.data?.message)
    return null
  }
}

async function testUserAccess(user) {
  console.log(`\n=== Testing ${user.role} Access ===\n`)
  
  const auth = await getAuthToken(user)
  if (!auth) {
    console.log(`❌ Could not authenticate as ${user.role}`)
    return
  }

  const headers = { Authorization: `Bearer ${auth.token}` }
  
  const tests = [
    { name: 'Vehicles', url: '/api/vehicles' },
    { name: 'Drivers', url: '/api/drivers' },
    { name: 'Vehicle Analytics', url: '/api/dashboard/vehicle-analytics' },
    { name: 'Top Drivers', url: '/api/dashboard/top-drivers' },
    { name: 'Expense Breakdown', url: '/api/dashboard/expense-breakdown' },
    { name: 'Dashboard KPIs', url: '/api/dashboard/kpis' }
  ]

  const results = []
  
  for (const test of tests) {
    try {
      const response = await axios.get(`http://localhost:5000${test.url}`, { headers })
      const count = response.data.data?.length || response.data.count || 0
      console.log(`✅ ${test.name}: ${count} items`)
      results.push({ test: test.name, status: 'success', count })
    } catch (error) {
      const status = error.response?.status
      const message = error.response?.data?.message || error.message
      console.log(`❌ ${test.name}: ${status} - ${message}`)
      results.push({ test: test.name, status: 'failed', error: `${status} - ${message}` })
    }
  }

  return { user: user.role, results }
}

async function runAllTests() {
  console.log('🧪 FleetFlow Access Control Test')
  console.log('=====================================')
  
  const allResults = []
  
  for (const user of users) {
    const result = await testUserAccess(user)
    allResults.push(result)
  }

  console.log('\n=== SUMMARY ===\n')
  
  allResults.forEach(result => {
    console.log(`${result.user}:`)
    result.results.forEach(r => {
      const icon = r.status === 'success' ? '✅' : '❌'
      console.log(`  ${icon} ${r.test}`)
    })
    console.log('')
  })

  // Check if Dispatcher and Safety Officer can access analytics
  const dispatcherResult = allResults.find(r => r.user === 'Dispatcher')
  const safetyResult = allResults.find(r => r.user === 'Safety Officer')
  
  if (dispatcherResult && safetyResult) {
    const dispatcherAnalytics = dispatcherResult.results.filter(r => 
      r.test.includes('Analytics') || r.test.includes('Drivers') || r.test.includes('Expense')
    ).every(r => r.status === 'success')
    
    const safetyAnalytics = safetyResult.results.filter(r => 
      r.test.includes('Analytics') || r.test.includes('Drivers') || r.test.includes('Expense')
    ).every(r => r.status === 'success')
    
    if (dispatcherAnalytics && safetyAnalytics) {
      console.log('🎉 SUCCESS: Dispatcher and Safety Officer can access analytics!')
    } else {
      console.log('❌ ISSUE: Some analytics endpoints are still blocked')
    }
  }

  console.log('\n✅ Testing completed!')
}

runAllTests().catch(console.error)
