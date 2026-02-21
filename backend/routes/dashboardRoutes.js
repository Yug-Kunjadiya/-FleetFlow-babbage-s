const express = require('express');
const {
  getDashboardKPIs,
  getFuelTrend,
  getRevenueVsExpenses,
  getUtilizationTrend,
  getVehicleAnalytics,
  getTopDrivers,
  getExpenseBreakdown
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// All dashboard routes require dashboard read permission
router.get('/kpis', protect, checkPermission('dashboard', 'read'), getDashboardKPIs);
router.get('/fuel-trend', protect, checkPermission('dashboard', 'read'), getFuelTrend);
router.get('/revenue-vs-expenses', protect, checkPermission('dashboard', 'read'), getRevenueVsExpenses);
router.get('/utilization-trend', protect, checkPermission('dashboard', 'read'), getUtilizationTrend);
router.get('/vehicle-analytics', protect, checkPermission('dashboard', 'read'), getVehicleAnalytics);
router.get('/top-drivers', protect, checkPermission('dashboard', 'read'), getTopDrivers);
router.get('/expense-breakdown', protect, checkPermission('dashboard', 'read'), getExpenseBreakdown);

module.exports = router;
