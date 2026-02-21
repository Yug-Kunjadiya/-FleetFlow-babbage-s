const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const axios = require('axios');

/**
 * @desc    Get all fuel logs
 * @route   GET /api/fuel-logs
 * @access  Private
 */
exports.getFuelLogs = async (req, res) => {
  try {
    const { vehicleId, tripId, startDate, endDate } = req.query;
    
    let query = {};
    
    if (vehicleId) query.vehicle = vehicleId;
    if (tripId) query.trip = tripId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const fuelLogs = await FuelLog.find(query)
      .populate('vehicle', 'name licensePlate vehicleType')
      .populate('trip', 'source destination distance')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: fuelLogs.length,
      data: fuelLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single fuel log
 * @route   GET /api/fuel-logs/:id
 * @access  Private
 */
exports.getFuelLog = async (req, res) => {
  try {
    const fuelLog = await FuelLog.findById(req.params.id)
      .populate('vehicle')
      .populate('trip');

    if (!fuelLog) {
      return res.status(404).json({
        success: false,
        message: 'Fuel log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fuelLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create fuel log with anomaly detection
 * @route   POST /api/fuel-logs
 * @access  Private
 */
exports.createFuelLog = async (req, res) => {
  try {
    const { trip: tripId, vehicle: vehicleId, liters, fuelCost } = req.body;

    // Get trip and vehicle data
    const trip = await Trip.findById(tripId);
    const vehicle = await Vehicle.findById(vehicleId);

    if (!trip || !vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Trip or Vehicle not found'
      });
    }

    // Create fuel log
    const fuelLog = await FuelLog.create(req.body);

    // Update vehicle fuel costs
    vehicle.totalFuelCost += fuelCost;
    
    // Calculate fuel efficiency
    if (trip.distance > 0 && liters > 0) {
      vehicle.fuelEfficiency = trip.distance / liters;
    }
    
    await vehicle.save();

    // AI Anomaly Detection
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/api/ai/detect-fuel-anomaly`,
        {
          actualFuel: liters,
          distance: trip.distance,
          vehicleType: vehicle.vehicleType,
          fuelEfficiency: vehicle.fuelEfficiency
        }
      );

      if (aiResponse.data.isAnomalous) {
        fuelLog.isAnomalous = true;
        fuelLog.anomalyReason = aiResponse.data.reason;
        await fuelLog.save();
      }
    } catch (aiError) {
      // Fallback anomaly detection
      const expectedFuel = vehicle.fuelEfficiency > 0 
        ? trip.distance / vehicle.fuelEfficiency 
        : liters;
      
      if (liters > expectedFuel * 1.2) { // 20% threshold
        fuelLog.isAnomalous = true;
        fuelLog.anomalyReason = `Actual fuel (${liters}L) exceeds expected (${expectedFuel.toFixed(2)}L) by 20%`;
        await fuelLog.save();
      }
    }

    const populatedLog = await FuelLog.findById(fuelLog._id)
      .populate('vehicle', 'name licensePlate')
      .populate('trip', 'source destination');

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('fuel-logged', { fuelLog: populatedLog });
    }

    res.status(201).json({
      success: true,
      data: populatedLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update fuel log
 * @route   PUT /api/fuel-logs/:id
 * @access  Private
 */
exports.updateFuelLog = async (req, res) => {
  try {
    let fuelLog = await FuelLog.findById(req.params.id);

    if (!fuelLog) {
      return res.status(404).json({
        success: false,
        message: 'Fuel log not found'
      });
    }

    fuelLog = await FuelLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('vehicle', 'name licensePlate')
      .populate('trip', 'source destination');

    res.status(200).json({
      success: true,
      data: fuelLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete fuel log
 * @route   DELETE /api/fuel-logs/:id
 * @access  Private (Financial Analyst, Fleet Manager)
 */
exports.deleteFuelLog = async (req, res) => {
  try {
    const fuelLog = await FuelLog.findById(req.params.id);

    if (!fuelLog) {
      return res.status(404).json({
        success: false,
        message: 'Fuel log not found'
      });
    }

    await fuelLog.deleteOne();

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
