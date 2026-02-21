const Driver = require('../models/Driver');
const axios = require('axios');

/**
 * @desc    Get all drivers
 * @route   GET /api/drivers
 * @access  Private
 */
exports.getDrivers = async (req, res) => {
  try {
    console.log('👨‍✈️ [DEBUG] getDrivers called by user:', req.user?.role);
    const { status, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('👨‍✈️ [DEBUG] Driver query:', JSON.stringify(query, null, 2));
    const drivers = await Driver.find(query).sort({ createdAt: -1 });
    console.log('👨‍✈️ [DEBUG] Found drivers:', drivers.length);

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.error('👨‍✈️ [ERROR] getDrivers:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single driver
 * @route   GET /api/drivers/:id
 * @access  Private
 */
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new driver
 * @route   POST /api/drivers
 * @access  Private (Fleet Manager, Safety Officer)
 */
exports.createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);

    res.status(201).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update driver
 * @route   PUT /api/drivers/:id
 * @access  Private (Fleet Manager, Safety Officer)
 */
exports.updateDriver = async (req, res) => {
  try {
    let driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete driver
 * @route   DELETE /api/drivers/:id
 * @access  Private (Fleet Manager)
 */
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    await driver.deleteOne();

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
 * @desc    Update driver safety score with AI
 * @route   POST /api/drivers/:id/update-safety-score
 * @access  Private (Safety Officer)
 */
exports.updateSafetyScore = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Call AI service to calculate safety score
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/api/ai/driver-risk-score`,
        {
          totalTrips: driver.totalTrips,
          completedTrips: driver.completedTrips,
          lateTrips: driver.lateTrips,
          violations: driver.violations,
          maintenanceIncidents: driver.maintenanceIncidents
        }
      );

      driver.safetyScore = aiResponse.data.safetyScore;
      await driver.save();

      res.status(200).json({
        success: true,
        data: driver,
        aiInsights: aiResponse.data
      });
    } catch (aiError) {
      // Fallback calculation if AI service is unavailable
      const completionRate = driver.totalTrips > 0 
        ? (driver.completedTrips / driver.totalTrips) * 100 
        : 100;
      const lateRate = driver.totalTrips > 0 
        ? (driver.lateTrips / driver.totalTrips) * 100 
        : 0;
      
      let score = 100;
      score -= lateRate * 0.5;
      score -= driver.violations * 5;
      score -= driver.maintenanceIncidents * 3;
      score = Math.max(0, Math.min(100, score));

      driver.safetyScore = Math.round(score);
      await driver.save();

      res.status(200).json({
        success: true,
        data: driver,
        message: 'Safety score calculated locally (AI service unavailable)'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get available drivers for trip
 * @route   GET /api/drivers/available
 * @access  Private
 */
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({
      status: 'On Duty',
      licenseExpiryDate: { $gt: new Date() },
      safetyScore: { $gte: 50 }
    }).sort({ safetyScore: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
