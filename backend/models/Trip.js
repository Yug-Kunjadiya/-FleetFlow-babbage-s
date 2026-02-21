const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver is required']
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Cargo weight is required'],
    min: [0, 'Cargo weight cannot be negative']
  },
  source: {
    type: String,
    required: [true, 'Source location is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination location is required'],
    trim: true
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  status: {
    type: String,
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  dispatchedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  initialOdometer: {
    type: Number
  },
  finalOdometer: {
    type: Number
  },
  costPerKm: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  estimatedDuration: {
    type: Number // in hours
  },
  actualDuration: {
    type: Number // in hours
  },
  isLate: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate if trip is late
tripSchema.pre('save', function(next) {
  if (this.status === 'Completed' && this.estimatedDuration && this.actualDuration) {
    this.isLate = this.actualDuration > this.estimatedDuration * 1.2; // 20% tolerance
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema);
