const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  licenseCategory: {
    type: String,
    required: [true, 'License category is required'],
    enum: ['A', 'B', 'C', 'D', 'E']
  },
  licenseExpiryDate: {
    type: Date,
    required: [true, 'License expiry date is required']
  },
  safetyScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['On Duty', 'Off Duty', 'On Trip', 'Suspended'],
    default: 'Off Duty'
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  // Statistics for AI scoring
  totalTrips: {
    type: Number,
    default: 0
  },
  completedTrips: {
    type: Number,
    default: 0
  },
  lateTrips: {
    type: Number,
    default: 0
  },
  violations: {
    type: Number,
    default: 0
  },
  maintenanceIncidents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual to check if license is expired
driverSchema.virtual('isLicenseExpired').get(function() {
  return new Date() > this.licenseExpiryDate;
});

// Virtual to check if driver is available for assignment
driverSchema.virtual('isAvailableForTrip').get(function() {
  return (
    this.status === 'On Duty' &&
    !this.isLicenseExpired &&
    this.safetyScore >= 50
  );
});

driverSchema.set('toJSON', { virtuals: true });
driverSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);
