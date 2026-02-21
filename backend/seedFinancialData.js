const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');
const Trip = require('./models/Trip');
const FuelLog = require('./models/FuelLog');
const Expense = require('./models/Expense');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedFinancialData = async () => {
  try {
    console.log('\n🌱 Starting to seed financial data...\n');

    // Get all vehicles and trips
    const vehicles = await Vehicle.find();
    const trips = await Trip.find();

    if (vehicles.length === 0) {
      console.log('⚠ No vehicles found. Please seed vehicles first.');
      return;
    }

    console.log(`📊 Found ${vehicles.length} vehicles and ${trips.length} trips`);

    // Clear existing financial data
    await FuelLog.deleteMany({});
    await Expense.deleteMany({});
    console.log('🗑️  Cleared existing fuel logs and expenses');

    // Generate fuel logs (last 30 days)
    const fuelLogs = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random 2-3 vehicles get fuel each day
      const numRefuels = Math.floor(Math.random() * 2) + 2;
      const selectedVehicles = vehicles.sort(() => 0.5 - Math.random()).slice(0, numRefuels);
      
      for (const vehicle of selectedVehicles) {
        const liters = Math.floor(Math.random() * 50) + 30; // 30-80 liters
        const costPerLiter = (Math.random() * 0.5 + 1.3).toFixed(2); // $1.30-$1.80 per liter
        const fuelCost = (liters * costPerLiter).toFixed(2);
        
        fuelLogs.push({
          vehicle: vehicle._id,
          date,
          liters,
          fuelCost: parseFloat(fuelCost),
          costPerLiter: parseFloat(costPerLiter),
          odometer: vehicle.odometer + Math.floor(Math.random() * 500),
          station: ['Shell', 'BP', 'Chevron', 'Exxon', 'Total'][Math.floor(Math.random() * 5)],
          filledBy: ['Driver', 'Manager', 'Dispatcher'][Math.floor(Math.random() * 3)]
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
          paymentMethod: ['Cash', 'Credit Card', 'Bank Transfer'][Math.floor(Math.random() * 3)]
        });
      }
    }

    const createdExpenses = await Expense.insertMany(expenses);
    console.log(`✓ Created ${createdExpenses.length} expenses`);

    // Update trips with revenue (for completed trips)
    const completedTrips = trips.filter(t => t.status === 'Completed');
    
    for (const trip of completedTrips) {
      const revenue = Math.floor(trip.distance * (Math.random() * 3 + 2)); // $2-$5 per km
      await Trip.findByIdAndUpdate(trip._id, { revenue });
    }
    console.log(`✓ Updated ${completedTrips.length} trip revenues`);

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

    // Display summary
    console.log('\n📊 Financial Data Summary:');
    console.log('═══════════════════════════════════════');
    
    const totalFuelCost = createdFuelLogs.reduce((sum, log) => sum + log.fuelCost, 0);
    const totalExpenses = createdExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRevenue = (await Trip.find({ status: 'Completed' }))
      .reduce((sum, trip) => sum + (trip.revenue || 0), 0);
    
    console.log(`Total Fuel Logs: ${createdFuelLogs.length}`);
    console.log(`Total Fuel Cost: $${totalFuelCost.toFixed(2)}`);
    console.log(`Total Expenses: ${createdExpenses.length} ($${totalExpenses.toFixed(2)})`);
    console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`Net Profit: $${(totalRevenue - totalExpenses).toFixed(2)}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('✅ Financial data seeded successfully!\n');
    
  } catch (error) {
    console.error('❌ Error seeding financial data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeder
connectDB().then(() => seedFinancialData());
