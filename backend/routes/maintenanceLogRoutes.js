const express = require('express');
const {
  getMaintenanceLogs,
  getMaintenanceLog,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
  predictMaintenance
} = require('../controllers/maintenanceLogController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// Get all maintenance logs - Fleet Manager, Safety Officer, Financial Analyst
router.get('/', protect, checkPermission('maintenance', 'read'), getMaintenanceLogs);

// Create maintenance log - Fleet Manager and Safety Officer
router.post('/', protect, checkPermission('maintenance', 'create'), createMaintenanceLog);

// Predict maintenance - Requires read permission
router.get('/predict/:vehicleId', protect, checkPermission('maintenance', 'read'), predictMaintenance);

// Get single maintenance log
router.get('/:id', protect, checkPermission('maintenance', 'read'), getMaintenanceLog);

// Update maintenance log - Fleet Manager and Safety Officer
router.put('/:id', protect, checkPermission('maintenance', 'update'), updateMaintenanceLog);

// Delete maintenance log - Fleet Manager only
router.delete('/:id', protect, checkPermission('maintenance', 'delete'), deleteMaintenanceLog);

module.exports = router;
