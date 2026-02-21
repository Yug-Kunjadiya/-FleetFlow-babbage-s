const Vehicle = require('../models/Vehicle');
const MaintenanceLog = require('../models/MaintenanceLog');

/**
 * @desc    Get all vehicles
 * @route   GET /api/vehicles
 * @access  Private
 */
exports.getVehicles = async (req, res) => {
  try {
    console.log('🚗 [DEBUG] getVehicles called by user:', req.user?.role);
    const { vehicleType, status, region, search } = req.query;
    
    let query = {};
    
    // Filters
    if (vehicleType) query.vehicleType = vehicleType;
    if (status) query.status = status;
    if (region) query.region = region;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('🚗 [DEBUG] Vehicle query:', JSON.stringify(query, null, 2));
    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    console.log('🚗 [DEBUG] Found vehicles:', vehicles.length);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('🚗 [ERROR] getVehicles:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single vehicle
 * @route   GET /api/vehicles/:id
 * @access  Private
 */
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new vehicle
 * @route   POST /api/vehicles
 * @access  Private (Fleet Manager)
 */
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('vehicle-updated', { action: 'created', vehicle });
    }

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update vehicle
 * @route   PUT /api/vehicles/:id
 * @access  Private (Fleet Manager)
 */
exports.updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Prevent updating retired vehicles
    if (vehicle.status === 'Retired' && req.body.status !== 'Retired') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a retired vehicle'
      });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('vehicle-updated', { action: 'updated', vehicle });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Private (Fleet Manager)
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    await vehicle.deleteOne();

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('vehicle-updated', { action: 'deleted', vehicleId: req.params.id });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get available vehicles for trip
 * @route   GET /api/vehicles/available
 * @access  Private
 */
exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      status: 'Available',
      $expr: { $ne: ['$status', 'Retired'] }
    }).sort({ fuelEfficiency: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
