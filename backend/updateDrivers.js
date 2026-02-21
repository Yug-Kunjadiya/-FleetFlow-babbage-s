const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const updateDrivers = async () => {
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'manager@fleetflow.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Get all drivers
    const driversRes = await axios.get(`${API_URL}/drivers`, { headers });
    const drivers = driversRes.data.data;

    console.log(`Updating ${drivers.length} drivers with valid license dates...\n`);

    // Update each driver with future license expiry
    for (const driver of drivers) {
      await axios.put(`${API_URL}/drivers/${driver._id}`, {
        licenseExpiryDate: '2028-12-31' // Far future date
      }, { headers });
      console.log(`✅ Updated: ${driver.name} - License valid until 2028-12-31`);
    }

    console.log('\n🎉 All drivers updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
};

updateDrivers();
