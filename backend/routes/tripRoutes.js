const express = require('express');
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  suggestVehicle
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// Get all trips - Multiple roles can read
router.get('/', protect, checkPermission('trips', 'read'), getTrips);

// Create trip - Dispatcher and Fleet Manager
router.post('/', protect, checkPermission('trips', 'create'), createTrip);

// Suggest vehicle for trip - Requires trip create permission
router.post('/suggest-vehicle', protect, checkPermission('trips', 'create'), suggestVehicle);

// Get single trip
router.get('/:id', protect, checkPermission('trips', 'read'), getTrip);

// Update trip - Dispatcher and Fleet Manager
router.put('/:id', protect, checkPermission('trips', 'update'), updateTrip);

// Delete trip - Fleet Manager only
router.delete('/:id', protect, checkPermission('trips', 'delete'), deleteTrip);

module.exports = router;
