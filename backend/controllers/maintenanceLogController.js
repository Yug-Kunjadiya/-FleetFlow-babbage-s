const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const axios = require('axios');

/**
 * @desc    Get all maintenance logs
 * @route   GET /api/maintenance-logs
 * @access  Private
 */
exports.getMaintenanceLogs = async (req, res) => {
  try {
    const { vehicleId, serviceType, startDate, endDate } = req.query;
    
    let query = {};
    
    if (vehicleId) query.vehicle = vehicleId;
    if (serviceType) query.serviceType = serviceType;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await MaintenanceLog.find(query)
      .populate('vehicle', 'name licensePlate vehicleType odometer')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single maintenance log
 * @route   GET /api/maintenance-logs/:id
 * @access  Private
 */
exports.getMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id)
      .populate('vehicle');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create maintenance log (auto updates vehicle status)
 * @route   POST /api/maintenance-logs
 * @access  Private
 */
exports.createMaintenanceLog = async (req, res) => {
  try {
    const { vehicle: vehicleId, cost } = req.body;

    // Get vehicle
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Create maintenance log
    const log = await MaintenanceLog.create({
      ...req.body,
      odometerAtService: vehicle.odometer
    });

    // Auto update vehicle status to "In Shop"
    vehicle.status = 'In Shop';
    vehicle.totalMaintenanceCost += cost;
    vehicle.lastServiceDate = log.date;
    await vehicle.save();

    const populatedLog = await MaintenanceLog.findById(log._id)
      .populate('vehicle', 'name licensePlate vehicleType');

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('maintenance-logged', { maintenanceLog: populatedLog });
    }

    res.status(201).json({
      success: true,
      data: populatedLog,
      message: 'Maintenance log created and vehicle status updated to "In Shop"'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update maintenance log
 * @route   PUT /api/maintenance-logs/:id
 * @access  Private
 */
exports.updateMaintenanceLog = async (req, res) => {
  try {
    let log = await MaintenanceLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance log not found'
      });
    }

    log = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('vehicle', 'name licensePlate vehicleType');

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete maintenance log
 * @route   DELETE /api/maintenance-logs/:id
 * @access  Private (Fleet Manager)
 */
exports.deleteMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance log not found'
      });
    }

    await log.deleteOne();

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
 * @desc    Get predictive maintenance for vehicle
 * @route   GET /api/maintenance-logs/predict/:vehicleId
 * @access  Private
 */
exports.predictMaintenance = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Get maintenance history
    const maintenanceLogs = await MaintenanceLog.find({ 
      vehicle: vehicle._id 
    }).sort({ date: -1 }).limit(5);

    // Call AI service for predictive maintenance
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/api/ai/predict-maintenance`,
        {
          odometer: vehicle.odometer,
          lastServiceDate: vehicle.lastServiceDate,
          fuelEfficiency: vehicle.fuelEfficiency,
          maintenanceHistory: maintenanceLogs.map(log => ({
            serviceType: log.serviceType,
            cost: log.cost,
            date: log.date,
            odometerAtService: log.odometerAtService
          }))
        }
      );

      // Extract prediction from AI service response
      const predictionData = aiResponse.data.prediction || aiResponse.data;
      
      res.status(200).json({
        success: true,
        data: predictionData
      });
    } catch (aiError) {
      // Fallback prediction logic
      let prediction = {
        needsMaintenance: false,
        daysUntilService: null,
        confidence: 'low',
        reasons: []
      };

      // Check odometer
      const lastServiceOdometer = maintenanceLogs.length > 0 
        ? maintenanceLogs[0].odometerAtService 
        : 0;
      const kmSinceService = vehicle.odometer - lastServiceOdometer;

      if (kmSinceService > 10000) {
        prediction.needsMaintenance = true;
        prediction.daysUntilService = 0;
        prediction.reasons.push(`${kmSinceService} km since last service (>10,000 km threshold)`);
      } else if (kmSinceService > 8000) {
        prediction.needsMaintenance = true;
        prediction.daysUntilService = 30;
        prediction.reasons.push(`${kmSinceService} km since last service (approaching 10,000 km)`);
      }

      // Check time since last service
      if (vehicle.lastServiceDate) {
        const daysSinceService = Math.floor(
          (new Date() - vehicle.lastServiceDate) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceService > 180) {
          prediction.needsMaintenance = true;
          prediction.daysUntilService = 0;
          prediction.reasons.push(`${daysSinceService} days since last service (>6 months)`);
        }
      }

      // Check fuel efficiency drop
      if (vehicle.fuelEfficiency < 8) {
        prediction.reasons.push('Low fuel efficiency may indicate maintenance needs');
      }

      res.status(200).json({
        success: true,
        data: prediction,
        message: 'Predicted locally (AI service unavailable)'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
