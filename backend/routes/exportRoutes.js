const express = require('express');
const { protect } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const Expense = require('../models/Expense');

const router = express.Router();

/**
 * @desc    Export vehicles to CSV
 * @route   GET /api/export/vehicles/csv
 * @access  Private
 */
router.get('/vehicles/csv', protect, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    
    const filePath = path.join(__dirname, '../exports', `vehicles-${Date.now()}.csv`);
    
    // Ensure exports directory exists
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'model', title: 'Model' },
        { id: 'licensePlate', title: 'License Plate' },
        { id: 'vehicleType', title: 'Type' },
        { id: 'status', title: 'Status' },
        { id: 'maxLoadCapacity', title: 'Max Load (kg)' },
        { id: 'odometer', title: 'Odometer (km)' },
        { id: 'fuelEfficiency', title: 'Fuel Efficiency (km/l)' },
        { id: 'acquisitionCost', title: 'Acquisition Cost' },
        { id: 'totalRevenue', title: 'Total Revenue' },
        { id: 'totalMaintenanceCost', title: 'Maintenance Cost' },
        { id: 'totalFuelCost', title: 'Fuel Cost' }
      ]
    });

    await csvWriter.writeRecords(vehicles);

    res.download(filePath, `vehicles-${Date.now()}.csv`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Export trips to CSV
 * @route   GET /api/export/trips/csv
 * @access  Private
 */
router.get('/trips/csv', protect, async (req, res) => {
  try {
    const trips = await Trip.find({})
      .populate('vehicle', 'name licensePlate')
      .populate('driver', 'name licenseNumber');
    
    const filePath = path.join(__dirname, '../exports', `trips-${Date.now()}.csv`);
    
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'vehicle', title: 'Vehicle' },
        { id: 'driver', title: 'Driver' },
        { id: 'source', title: 'Source' },
        { id: 'destination', title: 'Destination' },
        { id: 'distance', title: 'Distance (km)' },
        { id: 'cargoWeight', title: 'Cargo Weight (kg)' },
        { id: 'status', title: 'Status' },
        { id: 'revenue', title: 'Revenue' },
        { id: 'costPerKm', title: 'Cost per km' },
        { id: 'dispatchedAt', title: 'Dispatched At' },
        { id: 'completedAt', title: 'Completed At' }
      ]
    });

    const records = trips.map(trip => ({
      vehicle: trip.vehicle ? `${trip.vehicle.name} (${trip.vehicle.licensePlate})` : 'N/A',
      driver: trip.driver ? `${trip.driver.name} (${trip.driver.licenseNumber})` : 'N/A',
      source: trip.source,
      destination: trip.destination,
      distance: trip.distance,
      cargoWeight: trip.cargoWeight,
      status: trip.status,
      revenue: trip.revenue || 0,
      costPerKm: trip.costPerKm || 0,
      dispatchedAt: trip.dispatchedAt ? trip.dispatchedAt.toISOString() : '',
      completedAt: trip.completedAt ? trip.completedAt.toISOString() : ''
    }));

    await csvWriter.writeRecords(records);

    res.download(filePath, `trips-${Date.now()}.csv`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Export financial report to PDF
 * @route   GET /api/export/financial-report/pdf
 * @access  Private
 */
router.get('/financial-report/pdf', protect, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    const trips = await Trip.find({ status: 'Completed' });
    const expenses = await Expense.find({});

    // Calculate totals - MATCHING WEBSITE LOGIC
    // Revenue: Sum of all vehicle totalRevenue (same as vehicle analytics)
    const totalRevenue = vehicles.reduce((sum, v) => sum + (v.totalRevenue || 0), 0);
    
    // Expenses: Sum from Expense collection (same as expense breakdown)
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    // Net Profit: Revenue - Expenses (same as website)
    const netProfit = totalRevenue - totalExpenses;

    // Expense breakdown by category (same as website)
    const expensesByCategory = {};
    expenses.forEach(exp => {
      if (!expensesByCategory[exp.category]) {
        expensesByCategory[exp.category] = 0;
      }
      expensesByCategory[exp.category] += exp.amount;
    });

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '../exports', `financial-report-${Date.now()}.pdf`);
    
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24).text('FleetFlow Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(18).text('Financial Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
    doc.moveDown(0.5);
    
    // Expense breakdown
    doc.text('Total Expenses Breakdown:');
    Object.keys(expensesByCategory)
      .sort((a, b) => expensesByCategory[b] - expensesByCategory[a])
      .forEach(category => {
        doc.text(`  - ${category}: $${expensesByCategory[category].toFixed(2)}`);
      });
    doc.moveDown(0.5);
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, { continued: false });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor(netProfit >= 0 ? 'green' : 'red')
      .text(`Net Profit: $${netProfit.toFixed(2)}`, { bold: true });
    doc.fillColor('black').fontSize(12);
    doc.moveDown(2);

    // Fleet Overview
    doc.fontSize(18).text('Fleet Overview', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Vehicles: ${vehicles.length}`);
    doc.text(`Active Vehicles: ${vehicles.filter(v => v.status === 'On Trip').length}`);
    doc.text(`Vehicles in Maintenance: ${vehicles.filter(v => v.status === 'In Shop').length}`);
    doc.text(`Completed Trips: ${trips.length}`);
    doc.moveDown(2);

    // Top Performers
    doc.fontSize(18).text('Top Performing Vehicles (by ROI)', { underline: true });
    doc.moveDown();
    
    const vehiclesWithROI = vehicles
      .map(v => {
        const roi = v.acquisitionCost > 0 
          ? ((v.totalRevenue - v.totalMaintenanceCost - v.totalFuelCost) / v.acquisitionCost * 100)
          : 0;
        return { ...v._doc, roi };
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);

    doc.fontSize(10);
    vehiclesWithROI.forEach((v, idx) => {
      doc.text(`${idx + 1}. ${v.name} (${v.licensePlate}) - ROI: ${v.roi.toFixed(2)}%`);
    });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, `financial-report-${Date.now()}.pdf`, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
