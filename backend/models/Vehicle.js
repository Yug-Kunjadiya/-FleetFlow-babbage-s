const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  maxLoadCapacity: {
    type: Number,
    required: [true, 'Maximum load capacity is required'],
    min: [0, 'Capacity cannot be negative']
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Acquisition cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  odometer: {
    type: Number,
    default: 0,
    min: [0, 'Odometer cannot be negative']
  },
  vehicleType: {
    type: String,
    enum: ['Truck', 'Van', 'Bike'],
    required: [true, 'Vehicle type is required']
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
    default: 'Available'
  },
  region: {
    type: String,
    default: 'North'
  },
  fuelEfficiency: {
    type: Number,
    default: 0 // km per liter
  },
  lastServiceDate: {
    type: Date
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalMaintenanceCost: {
    type: Number,
    default: 0
  },
  totalFuelCost: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual field for ROI calculation
vehicleSchema.virtual('roi').get(function() {
  if (this.acquisitionCost === 0) return 0;
  const totalCost = this.totalMaintenanceCost + this.totalFuelCost;
  return ((this.totalRevenue - totalCost) / this.acquisitionCost * 100).toFixed(2);
});

vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
