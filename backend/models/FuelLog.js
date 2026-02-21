const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Trip is required']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  liters: {
    type: Number,
    required: [true, 'Liters is required'],
    min: [0, 'Liters cannot be negative']
  },
  fuelCost: {
    type: Number,
    required: [true, 'Fuel cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  costPerLiter: {
    type: Number
  },
  maintenanceCost: {
    type: Number,
    default: 0,
    min: [0, 'Cost cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    trim: true
  },
  odometer: {
    type: Number
  },
  // AI anomaly detection
  isAnomalous: {
    type: Boolean,
    default: false
  },
  anomalyReason: {
    type: String
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate cost per liter before saving
fuelLogSchema.pre('save', function(next) {
  if (this.liters > 0) {
    this.costPerLiter = (this.fuelCost / this.liters).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('FuelLog', fuelLogSchema);
