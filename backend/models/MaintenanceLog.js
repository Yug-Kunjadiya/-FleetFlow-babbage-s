const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'Oil Change',
      'Tire Replacement',
      'Brake Service',
      'Engine Repair',
      'Transmission Service',
      'Electrical Repair',
      'Body Work',
      'General Inspection',
      'Emergency Repair',
      'Other'
    ]
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  performedBy: {
    type: String,
    trim: true
  },
  odometerAtService: {
    type: Number
  },
  nextServiceDue: {
    type: Date
  },
  partsReplaced: [{
    type: String
  }],
  workOrderNumber: {
    type: String,
    trim: true
  },
  isWarranty: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
