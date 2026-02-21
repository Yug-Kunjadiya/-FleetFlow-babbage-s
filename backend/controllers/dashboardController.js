const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const Expense = require('../models/Expense');

/**
 * @desc    Get dashboard KPIs
 * @route   GET /api/dashboard/kpis
 * @access  Private
 */
exports.getDashboardKPIs = async (req, res) => {
  try {
    // Active Fleet (On Trip)
    const activeFleet = await Vehicle.countDocuments({ status: 'On Trip' });

    // Maintenance Alerts (In Shop)
    const maintenanceAlerts = await Vehicle.countDocuments({ status: 'In Shop' });

    // Total vehicles
    const totalVehicles = await Vehicle.countDocuments({ 
      status: { $ne: 'Retired' } 
    });

    // Utilization Rate
    const utilizationRate = totalVehicles > 0 
      ? ((activeFleet / totalVehicles) * 100).toFixed(2) 
      : 0;

    // Pending Cargo (Draft trips)
    const pendingCargo = await Trip.countDocuments({ status: 'Draft' });

    // Active trips
    const activeTrips = await Trip.countDocuments({ status: 'Dispatched' });

    // Completed trips (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const completedTripsThisMonth = await Trip.countDocuments({
      status: 'Completed',
      completedAt: { $gte: startOfMonth }
    });

    // Total revenue this month
    const revenueData = await Trip.aggregate([
      {
        $match: {
          status: 'Completed',
          completedAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' }
        }
      }
    ]);

    const monthlyRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Total expenses this month
    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyExpenses = expenseData.length > 0 ? expenseData[0].totalExpenses : 0;

    // Available drivers
    const availableDrivers = await Driver.countDocuments({ 
      status: 'On Duty',
      licenseExpiryDate: { $gt: new Date() }
    });

    // ── Financial KPIs (all-time) ──────────────────────────────────────────
    // All-time revenue from completed trips
    const allTimeRevenueData = await Trip.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$revenue' }, count: { $sum: 1 } } }
    ]);
    const totalRevenue = allTimeRevenueData[0]?.total || 0;
    const totalCompletedTrips = allTimeRevenueData[0]?.count || 0;

    // All-time expenses: fuel + maintenance + Expense model
    const [fuelTotalData, maintTotalData, expenseTotalData] = await Promise.all([
      FuelLog.aggregate([{ $group: { _id: null, total: { $sum: '$fuelCost' } } }]),
      MaintenanceLog.aggregate([{ $group: { _id: null, total: { $sum: '$cost' } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    const totalFuelCost      = fuelTotalData[0]?.total  || 0;
    const totalMaintCost     = maintTotalData[0]?.total || 0;
    const totalExpensesModel = expenseTotalData[0]?.total || 0;
    // Use whichever is larger (Expense model may already aggregate fuel+maint)
    const totalExpenses = totalExpensesModel > (totalFuelCost + totalMaintCost)
      ? totalExpensesModel
      : totalFuelCost + totalMaintCost;

    const avgRevenuePerTrip = totalCompletedTrips > 0
      ? parseFloat((totalRevenue / totalCompletedTrips).toFixed(2))
      : 0;
    const avgCostPerTrip = totalCompletedTrips > 0
      ? parseFloat((totalExpenses / totalCompletedTrips).toFixed(2))
      : 0;

    // Fleet ROI = (totalRevenue - totalExpenses) / totalExpenses * 100
    const fleetROI = totalExpenses > 0
      ? parseFloat(((totalRevenue - totalExpenses) / totalExpenses * 100).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        activeFleet,
        maintenanceAlerts,
        utilizationRate: parseFloat(utilizationRate),
        pendingCargo,
        activeTrips,
        completedTripsThisMonth,
        monthlyRevenue,
        monthlyExpenses,
        availableDrivers,
        totalVehicles,
        // Financial fields
        totalRevenue,
        totalExpenses,
        avgRevenuePerTrip,
        avgCostPerTrip,
        fleetROI
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get fuel cost over time (chart data)
 * @route   GET /api/dashboard/fuel-trend
 * @access  Private
 */
exports.getFuelTrend = async (req, res) => {
  try {
    const { period = '6' } = req.query; // months (default last 6 months)
    const monthsAgo = parseInt(period);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsAgo);

    const fuelTrend = await FuelLog.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$date" }
          },
          totalCost: { $sum: '$fuelCost' },
          totalLiters: { $sum: '$liters' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: fuelTrend.map(item => ({
        month: item._id,
        date: item._id,
        cost: item.totalCost,
        liters: item.totalLiters,
        consumption: item.totalLiters  // alias expected by frontend
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get revenue vs expenses (chart data)
 * @route   GET /api/dashboard/revenue-vs-expenses
 * @access  Private
 */
exports.getRevenueVsExpenses = async (req, res) => {
  try {
    const { period = '6' } = req.query; // months
    const monthsAgo = parseInt(period);
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsAgo);

    // Revenue data
    const revenueData = await Trip.aggregate([
      {
        $match: {
          status: 'Completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m", date: "$completedAt" }
          },
          revenue: { $sum: '$revenue' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Expense data — combine FuelLog + MaintenanceLog + Expense model
    const [fuelExpenseData, maintExpenseData, generalExpenseData] = await Promise.all([
      FuelLog.aggregate([
        { $match: { date: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, expenses: { $sum: '$fuelCost' } } },
        { $sort: { _id: 1 } }
      ]),
      MaintenanceLog.aggregate([
        { $match: { date: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, expenses: { $sum: '$cost' } } },
        { $sort: { _id: 1 } }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, expenses: { $sum: '$amount' } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Merge all expense sources by month
    const expenseMap = new Map();
    const addToExpenseMap = (data) => data.forEach(e => {
      expenseMap.set(e._id, (expenseMap.get(e._id) || 0) + e.expenses);
    });
    addToExpenseMap(fuelExpenseData);
    addToExpenseMap(maintExpenseData);
    addToExpenseMap(generalExpenseData);

    // Revenue map
    const revenueMap = new Map(revenueData.map(r => [r._id, r.revenue]));
    
    const allMonths = new Set([...revenueMap.keys(), ...expenseMap.keys()]);
    const chartData = Array.from(allMonths).sort().map(month => ({
      month,
      revenue: revenueMap.get(month) || 0,
      expenses: expenseMap.get(month) || 0
    }));

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get fleet utilization trend
 * @route   GET /api/dashboard/utilization-trend
 * @access  Private
 */
exports.getUtilizationTrend = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const totalVehicles = await Vehicle.countDocuments({ 
      status: { $ne: 'Retired' } 
    });

    // Get trips per day
    const utilizationData = await Trip.aggregate([
      {
        $match: {
          status: { $in: ['Dispatched', 'Completed'] },
          dispatchedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$dispatchedAt" }
          },
          activeVehicles: { $addToSet: '$vehicle' }
        }
      },
      {
        $project: {
          date: '$_id',
          count: { $size: '$activeVehicles' },
          utilizationRate: { 
            $multiply: [
              { $divide: [{ $size: '$activeVehicles' }, totalVehicles] }, 
              100
            ] 
          }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: utilizationData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get vehicle analytics (ROI, efficiency, costs)
 * @route   GET /api/dashboard/vehicle-analytics
 * @access  Private (Financial Analyst, Fleet Manager)
 */
exports.getVehicleAnalytics = async (req, res) => {
  try {
    console.log('📊 [DEBUG] getVehicleAnalytics called by user:', req.user?.role);
    const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });
    console.log('📊 [DEBUG] Found vehicles for analytics:', vehicles.length);

    const analytics = vehicles.map(v => {
      const roi = v.acquisitionCost > 0 
        ? ((v.totalRevenue - v.totalMaintenanceCost - v.totalFuelCost) / v.acquisitionCost * 100)
        : 0;
      
      const totalCost = v.totalMaintenanceCost + v.totalFuelCost;
      const costPerKm = v.odometer > 0 ? totalCost / v.odometer : 0;

      return {
        id: v._id,
        name: v.name,
        licensePlate: v.licensePlate,
        vehicleType: v.vehicleType,
        fuelEfficiency: v.fuelEfficiency,
        roi: roi.toFixed(2),
        totalRevenue: v.totalRevenue,
        totalMaintenanceCost: v.totalMaintenanceCost,
        totalFuelCost: v.totalFuelCost,
        totalCost,
        costPerKm: costPerKm.toFixed(2),
        odometer: v.odometer
      };
    });

    // Sort by ROI
    analytics.sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi));
    console.log('📊 [DEBUG] Vehicle analytics calculated:', analytics.length);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('📊 [ERROR] getVehicleAnalytics:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get top performing drivers
 * @route   GET /api/dashboard/top-drivers
 * @access  Private
 */
exports.getTopDrivers = async (req, res) => {
  try {
    console.log('🏆 [DEBUG] getTopDrivers called by user:', req.user?.role);
    const drivers = await Driver.find({
      totalTrips: { $gt: 0 }
    }).sort({ safetyScore: -1, completedTrips: -1 }).limit(10);
    console.log('🏆 [DEBUG] Found drivers with trips:', drivers.length);

    const driverStats = drivers.map(d => ({
      id: d._id,
      name: d.name,
      licenseNumber: d.licenseNumber,
      safetyScore: d.safetyScore,
      totalTrips: d.totalTrips,
      completedTrips: d.completedTrips,
      completionRate: d.totalTrips > 0 
        ? ((d.completedTrips / d.totalTrips) * 100).toFixed(2) 
        : 0,
      lateTrips: d.lateTrips,
      status: d.status
    }));

    console.log('🏆 [DEBUG] Driver stats calculated:', driverStats.length);
    res.status(200).json({
      success: true,
      data: driverStats
    });
  } catch (error) {
    console.error('🏆 [ERROR] getTopDrivers:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get expense breakdown by category
 * @route   GET /api/dashboard/expense-breakdown
 * @access  Private (Financial Analyst)
 */
exports.getExpenseBreakdown = async (req, res) => {
  try {
    console.log('💰 [DEBUG] getExpenseBreakdown called by user:', req.user?.role);
    const { startDate, endDate } = req.query;

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    // Pull from Expense model (general categories)
    const expenseBreakdown = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } }
    ]);

    // Always include fuel and maintenance totals from their own collections
    const [fuelTotal, maintTotal] = await Promise.all([
      FuelLog.aggregate([
        ...(Object.keys(matchQuery).length ? [{ $match: matchQuery }] : []),
        { $group: { _id: null, total: { $sum: '$fuelCost' }, count: { $sum: 1 } } }
      ]),
      MaintenanceLog.aggregate([
        ...(Object.keys(matchQuery).length ? [{ $match: matchQuery }] : []),
        { $group: { _id: null, total: { $sum: '$cost' }, count: { $sum: 1 } } }
      ])
    ]);

    // Build combined map
    const combinedMap = new Map();
    expenseBreakdown.forEach(e => combinedMap.set(e._id, { amount: e.totalAmount, count: e.count }));

    // Add or merge Fuel
    if (fuelTotal[0]?.total > 0) {
      const key = 'Fuel';
      const existing = combinedMap.get(key) || { amount: 0, count: 0 };
      combinedMap.set(key, { amount: existing.amount + fuelTotal[0].total, count: existing.count + fuelTotal[0].count });
    }
    // Add or merge Maintenance
    if (maintTotal[0]?.total > 0) {
      const key = 'Maintenance';
      const existing = combinedMap.get(key) || { amount: 0, count: 0 };
      combinedMap.set(key, { amount: existing.amount + maintTotal[0].total, count: existing.count + maintTotal[0].count });
    }

    const totalAmount = Array.from(combinedMap.values()).reduce((s, v) => s + v.amount, 0);

    // Sort by amount desc
    const data = Array.from(combinedMap.entries())
      .sort(([, a], [, b]) => b.amount - a.amount)
      .map(([category, v]) => ({
        category,
        name: category,          // PieChart uses 'name'
        amount: v.amount,
        value: v.amount,         // PieChart uses 'value'
        count: v.count,
        percentage: totalAmount > 0 ? parseFloat(((v.amount / totalAmount) * 100).toFixed(2)) : 0
      }));

    console.log('💰 [DEBUG] Combined expense breakdown:', data.length, 'categories, total:', totalAmount);

    res.status(200).json({
      success: true,
      data,
      total: totalAmount
    });
  } catch (error) {
    console.error('💰 [ERROR] getExpenseBreakdown:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
