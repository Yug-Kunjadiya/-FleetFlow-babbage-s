const express = require('express');
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  updateSafetyScore,
  getAvailableDrivers
} = require('../controllers/driverController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// Get all drivers - Multiple roles can read
router.get('/', protect, checkPermission('drivers', 'read'), getDrivers);

// Create driver - Fleet Manager and Safety Officer
router.post('/', protect, checkPermission('drivers', 'create'), createDriver);

// Get available drivers
router.get('/available', protect, checkPermission('drivers', 'read'), getAvailableDrivers);

// Update safety score - Safety Officer and Fleet Manager
router.post('/:id/update-safety-score', 
  protect, 
  checkPermission('drivers', 'update'), 
  updateSafetyScore
);

// Get single driver
router.get('/:id', protect, checkPermission('drivers', 'read'), getDriver);

// Update driver - Fleet Manager and Safety Officer
router.put('/:id', protect, checkPermission('drivers', 'update'), updateDriver);

// Delete driver - Fleet Manager only
router.delete('/:id', protect, checkPermission('drivers', 'delete'), deleteDriver);

module.exports = router;
