const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fuel', 'Maintenance', 'Insurance', 'License', 'Salary', 'Parking', 'Toll', 'Other']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
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
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Check'],
    default: 'Cash'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
