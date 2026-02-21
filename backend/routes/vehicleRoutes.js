const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// Get all vehicles - All authenticated users can read
router.get('/', protect, checkPermission('vehicles', 'read'), getVehicles);

// Create vehicle - Only Fleet Manager
router.post('/', protect, checkPermission('vehicles', 'create'), createVehicle);

// Get available vehicles - All authenticated users
router.get('/available', protect, checkPermission('vehicles', 'read'), getAvailableVehicles);

// Get single vehicle - All authenticated users
router.get('/:id', protect, checkPermission('vehicles', 'read'), getVehicle);

// Update vehicle - Fleet Manager only
router.put('/:id', protect, checkPermission('vehicles', 'update'), updateVehicle);

// Delete vehicle - Fleet Manager only
router.delete('/:id', protect, checkPermission('vehicles', 'delete'), deleteVehicle);

module.exports = router;
