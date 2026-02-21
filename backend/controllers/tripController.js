const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const axios = require('axios');

/**
 * @desc    Get all trips
 * @route   GET /api/trips
 * @access  Private
 */
exports.getTrips = async (req, res) => {
  try {
    const { status, vehicleId, driverId } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (vehicleId) query.vehicle = vehicleId;
    if (driverId) query.driver = driverId;

    const trips = await Trip.find(query)
      .populate('vehicle', 'name licensePlate vehicleType')
      .populate('driver', 'name licenseNumber safetyScore')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single trip
 * @route   GET /api/trips/:id
 * @access  Private
 */
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver')
      .populate('createdBy', 'name email');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new trip (draft)
 * @route   POST /api/trips
 * @access  Private (Dispatcher, Fleet Manager)
 */
exports.createTrip = async (req, res) => {
  try {
    const { vehicle, driver, cargoWeight, source, destination, distance } = req.body;

    // Validate vehicle
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Validate driver
    const driverDoc = await Driver.findById(driver);
    if (!driverDoc) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Validation: Check cargo weight
    if (cargoWeight > vehicleDoc.maxLoadCapacity) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicleDoc.maxLoadCapacity} kg)`
      });
    }

    // Validation: Check vehicle status (for dispatch)
    if (req.body.status === 'Dispatched' && vehicleDoc.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Vehicle status is '${vehicleDoc.status}', must be 'Available' to dispatch`
      });
    }

    // Validation: Check if driver license is expired
    if (new Date() > driverDoc.licenseExpiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Driver license has expired'
      });
    }

    // Validation: Check driver status (for dispatch)
    if (req.body.status === 'Dispatched' && driverDoc.status !== 'On Duty') {
      return res.status(400).json({
        success: false,
        message: `Driver status is '${driverDoc.status}', must be 'On Duty' to dispatch`
      });
    }

    // Create trip
    const trip = await Trip.create({
      ...req.body,
      createdBy: req.user.id
    });

    // If dispatched, update vehicle and driver status
    if (trip.status === 'Dispatched') {
      vehicleDoc.status = 'On Trip';
      driverDoc.status = 'On Trip';
      trip.dispatchedAt = new Date();
      trip.initialOdometer = vehicleDoc.odometer;
      
      await vehicleDoc.save();
      await driverDoc.save();
      await trip.save();
    }

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'name licensePlate vehicleType')
      .populate('driver', 'name licenseNumber');

    res.status(201).json({
      success: true,
      data: populatedTrip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update trip (dispatch, complete, cancel)
 * @route   PUT /api/trips/:id
 * @access  Private (Dispatcher, Fleet Manager)
 */
exports.updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const oldStatus = trip.status;
    const newStatus = req.body.status;

    // Handle status transitions
    if (newStatus && newStatus !== oldStatus) {
      const vehicle = await Vehicle.findById(trip.vehicle);
      const driver = await Driver.findById(trip.driver);

      if (newStatus === 'Dispatched' && oldStatus === 'Draft') {
        // Dispatch trip
        vehicle.status = 'On Trip';
        driver.status = 'On Trip';
        trip.dispatchedAt = new Date();
        trip.initialOdometer = vehicle.odometer;
        
        await vehicle.save();
        await driver.save();
      }

      if (newStatus === 'Completed' && oldStatus === 'Dispatched') {
        // Complete trip
        vehicle.status = 'Available';
        driver.status = 'On Duty';
        trip.completedAt = new Date();
        
        // Update odometer
        if (req.body.finalOdometer) {
          trip.finalOdometer = req.body.finalOdometer;
          vehicle.odometer = req.body.finalOdometer;
          
          // Calculate cost per km
          const actualDistance = trip.finalOdometer - trip.initialOdometer;
          if (actualDistance > 0) {
            trip.costPerKm = (trip.revenue || 0) / actualDistance;
          }
        }

        // Calculate actual duration
        if (trip.dispatchedAt) {
          const duration = (new Date() - trip.dispatchedAt) / (1000 * 60 * 60); // hours
          trip.actualDuration = duration;
        }

        // Update driver statistics
        driver.totalTrips += 1;
        driver.completedTrips += 1;
        if (trip.isLate) {
          driver.lateTrips += 1;
        }

        await vehicle.save();
        await driver.save();
      }

      if (newStatus === 'Cancelled') {
        // Cancel trip
        if (oldStatus === 'Dispatched') {
          vehicle.status = 'Available';
          driver.status = 'On Duty';
          await vehicle.save();
          await driver.save();
        }
      }
    }

    // Update trip
    trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status: newStatus },
      { new: true, runValidators: true }
    )
      .populate('vehicle', 'name licensePlate vehicleType')
      .populate('driver', 'name licenseNumber');

    // Emit socket event for real-time update
    if (req.io) {
      if (newStatus === 'Completed') {
        req.io.emit('trip-completed', { trip });
      } else {
        req.io.emit('trip-updated', { trip });
      }
    }

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete trip
 * @route   DELETE /api/trips/:id
 * @access  Private (Fleet Manager)
 */
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Cannot delete dispatched or completed trips
    if (trip.status === 'Dispatched' || trip.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete dispatched or completed trips'
      });
    }

    await trip.deleteOne();

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
 * @desc    Get smart vehicle suggestion for trip
 * @route   POST /api/trips/suggest-vehicle
 * @access  Private
 */
exports.suggestVehicle = async (req, res) => {
  try {
    const { cargoWeight, distance } = req.body;

    // Get available vehicles
    const vehicles = await Vehicle.find({
      status: 'Available',
      maxLoadCapacity: { $gte: cargoWeight }
    });

    if (vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available vehicles matching criteria'
      });
    }

    // Call AI service for smart suggestion
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/api/ai/suggest-vehicle`,
        {
          vehicles: vehicles.map(v => ({
            id: v._id,
            fuelEfficiency: v.fuelEfficiency,
            maxLoadCapacity: v.maxLoadCapacity,
            totalMaintenanceCost: v.totalMaintenanceCost,
            odometer: v.odometer,
            lastServiceDate: v.lastServiceDate
          })),
          cargoWeight,
          distance
        }
      );

      res.status(200).json({
        success: true,
        data: aiResponse.data
      });
    } catch (aiError) {
      // Fallback scoring if AI service unavailable
      const scoredVehicles = vehicles.map(v => {
        let score = 0;
        
        // Fuel efficiency weight (40%)
        score += (v.fuelEfficiency || 0) * 4;
        
        // Load capacity match (30%)
        const capacityUtilization = (cargoWeight / v.maxLoadCapacity) * 100;
        if (capacityUtilization >= 70 && capacityUtilization <= 90) {
          score += 30;
        } else if (capacityUtilization >= 50 && capacityUtilization < 70) {
          score += 20;
        } else {
          score += 10;
        }
        
        // Maintenance history (30%)
        const maintenanceCostPerKm = v.odometer > 0 
          ? v.totalMaintenanceCost / v.odometer 
          : 0;
        score += Math.max(0, 30 - (maintenanceCostPerKm * 10));

        return {
          vehicle: v,
          score: Math.round(score),
          reasons: [
            `Fuel efficiency: ${v.fuelEfficiency || 0} km/l`,
            `Capacity utilization: ${capacityUtilization.toFixed(1)}%`,
            `Maintenance cost: $${maintenanceCostPerKm.toFixed(2)}/km`
          ]
        };
      });

      // Sort by score
      scoredVehicles.sort((a, b) => b.score - a.score);

      res.status(200).json({
        success: true,
        data: {
          recommendation: scoredVehicles[0],
          alternatives: scoredVehicles.slice(1, 4)
        },
        message: 'Scored locally (AI service unavailable)'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
