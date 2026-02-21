const express = require('express');
const {
  getFuelLogs,
  getFuelLog,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog
} = require('../controllers/fuelLogController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// Get all fuel logs - Fleet Manager and Financial Analyst
router.get('/', protect, checkPermission('fuelLogs', 'read'), getFuelLogs);

// Create fuel log - Fleet Manager only
router.post('/', protect, checkPermission('fuelLogs', 'create'), createFuelLog);

// Get single fuel log
router.get('/:id', protect, checkPermission('fuelLogs', 'read'), getFuelLog);

// Update fuel log - Fleet Manager only
router.put('/:id', protect, checkPermission('fuelLogs', 'update'), updateFuelLog);

// Delete fuel log - Fleet Manager only
router.delete('/:id', protect, checkPermission('fuelLogs', 'delete'), deleteFuelLog);

module.exports = router;
