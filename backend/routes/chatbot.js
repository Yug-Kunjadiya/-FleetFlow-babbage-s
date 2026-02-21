const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const Expense = require('../models/Expense');

/**
 * AI Chatbot endpoint - Provides intelligent responses based on fleet data
 * @route   POST /api/chatbot/message
 * @access  Public (can add protect middleware if needed)
 */
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userMessage = message.toLowerCase().trim();
    let response = '';

    // Fetch all necessary data
    const vehicles = await Vehicle.find({});
    const drivers = await Driver.find({});
    const trips = await Trip.find({});
    const maintenanceLogs = await MaintenanceLog.find({});
    const fuelLogs = await FuelLog.find({});
    const expenses = await Expense.find({});

    // Greetings
    if (userMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
      response = `Hello! I'm your FleetFlow AI Assistant. How can I help you today?`;
    }
    
    // Thank you
    else if (userMessage.includes('thank')) {
      response = `You're welcome! Let me know if you need anything else.`;
    }
    
    // Question: Which vehicle is best for carrying weight/cargo?
    else if (userMessage.includes('best') && (userMessage.includes('kg') || userMessage.includes('weight') || userMessage.includes('cargo') || userMessage.includes('carry'))) {
      // Extract weight if mentioned
      const weightMatch = userMessage.match(/(\d+)\s*kg/);
      const requestedWeight = weightMatch ? parseInt(weightMatch[1]) : 0;

      // Filter available vehicles with capacity data
      const availableVehicles = vehicles.filter(v => 
        v.status === 'Available' && v.maxLoadCapacity && v.maxLoadCapacity > 0
      );

      if (availableVehicles.length === 0) {
        response = `I couldn't find any available vehicles with capacity information. However, you have ${vehicles.length} vehicles in total. Consider adding capacity details to your vehicle profiles.`;
      } else {
        // Sort by capacity
        const sortedVehicles = availableVehicles.sort((a, b) => b.maxLoadCapacity - a.maxLoadCapacity);
        
        if (requestedWeight > 0) {
          const suitableVehicles = sortedVehicles.filter(v => v.maxLoadCapacity >= requestedWeight);
          
          if (suitableVehicles.length === 0) {
            response = `For ${requestedWeight}kg, none of the available vehicles meet this capacity requirement. The highest capacity available is ${sortedVehicles[0].model} (${sortedVehicles[0].registrationNumber}) with ${sortedVehicles[0].maxLoadCapacity}kg capacity.`;
          } else {
            const bestVehicle = suitableVehicles[0];
            response = `For ${requestedWeight}kg cargo, I recommend **${bestVehicle.model}** (${bestVehicle.registrationNumber}) with ${bestVehicle.maxLoadCapacity}kg capacity. `;
            
            // Add maintenance status
            const vehicleMaintenance = maintenanceLogs.filter(m => m.vehicle.toString() === bestVehicle._id.toString());
            if (vehicleMaintenance.length > 0) {
              const lastMaintenance = vehicleMaintenance.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))[0];
              response += `Last service: ${new Date(lastMaintenance.serviceDate).toLocaleDateString()}.`;
            }
            
            if (suitableVehicles.length > 1) {
              response += `\n\nOther options:\n`;
              suitableVehicles.slice(1, 3).forEach(v => {
                response += `• ${v.model} (${v.registrationNumber}) - ${v.maxLoadCapacity}kg capacity\n`;
              });
            }
          }
        } else {
          response = `Here are your available vehicles sorted by capacity:\n\n`;
          sortedVehicles.slice(0, 5).forEach((v, i) => {
            response += `${i + 1}. **${v.model}** (${v.registrationNumber}) - ${v.maxLoadCapacity}kg capacity\n`;
          });
        }
      }
    }
    
    // Question: Vehicle recommendations or best vehicle
    else if ((userMessage.includes('which') || userMessage.includes('recommend') || userMessage.includes('suggest')) && userMessage.includes('vehicle')) {
      const availableVehicles = vehicles.filter(v => v.status === 'Available');
      
      if (availableVehicles.length === 0) {
        response = `All vehicles are currently in use. You have ${vehicles.length} total vehicles. Check back soon!`;
      } else {
        response = `You have ${availableVehicles.length} available vehicle(s):\n\n`;
        
        availableVehicles.forEach((v, i) => {
          const vehicleTrips = trips.filter(t => t.vehicle && t.vehicle.toString() === v._id.toString());
          const completedTrips = vehicleTrips.filter(t => t.status === 'Completed').length;
          
          response += `${i + 1}. **${v.model}** (${v.registrationNumber})\n`;
          response += `   • Capacity: ${v.maxLoadCapacity || 'N/A'}kg\n`;
          response += `   • Odometer: ${v.odometer || 0}km\n`;
          response += `   • Completed trips: ${completedTrips}\n`;
          response += `   • Fuel: ${v.fuelType || 'N/A'}\n\n`;
        });
      }
    }
    
    // Question: Maintenance related
    else if (userMessage.includes('maintenance') || userMessage.includes('service') || userMessage.includes('repair')) {
      const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
      const vehiclesNeedingMaintenance = vehicles.filter(v => {
        const lastMaintenance = maintenanceLogs
          .filter(m => m.vehicle.toString() === v._id.toString())
          .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))[0];
        
        if (!lastMaintenance) return true; // Never serviced
        
        const daysSinceService = (Date.now() - new Date(lastMaintenance.serviceDate)) / (1000 * 60 * 60 * 24);
        return daysSinceService > 90; // Over 90 days
      });

      response = `**Maintenance:**\n`;
      response += `• Logs: ${maintenanceLogs.length}, Cost: $${totalMaintenanceCost.toFixed(2)}\n`;
      response += `• Need service: ${vehiclesNeedingMaintenance.length}\n`;
      
      if (vehiclesNeedingMaintenance.length > 0) {
        response += `\n**Due for service:**\n`;
        vehiclesNeedingMaintenance.slice(0, 3).forEach((v, i) => {
          response += `${i + 1}. ${v.model} - ${v.odometer || 0}km\n`;
        });
      }
    }
    
    // Question: Cost, expense, financial
    else if (userMessage.includes('cost') || userMessage.includes('expense') || userMessage.includes('profit') || userMessage.includes('revenue')) {
      const completedTrips = trips.filter(t => t.status === 'Completed');
      const totalRevenue = completedTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
      const totalFuelCost = fuelLogs.reduce((sum, log) => sum + (log.fuelCost || 0), 0);
      const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
      const totalOtherExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const totalExpenses = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;
      const netProfit = totalRevenue - totalExpenses;

      response = `**Financials:**\n`;
      response += `💰 Revenue: $${totalRevenue.toFixed(2)}\n`;
      response += `📊 Expenses: $${totalExpenses.toFixed(2)}\n`;
      response += `${netProfit >= 0 ? '✅' : '⚠️'} Net Profit: $${netProfit.toFixed(2)}\n`;
      response += `\nBreakdown: Fuel $${totalFuelCost.toFixed(2)}, Maintenance $${totalMaintenanceCost.toFixed(2)}, Other $${totalOtherExpenses.toFixed(2)}`;
    }
    
    // Question: Drivers
    else if (userMessage.includes('driver')) {
      const availableDrivers = drivers.filter(d => d.status === 'Available');
      const totalTrips = drivers.reduce((sum, d) => sum + (d.totalTrips || 0), 0);

      response = `**Drivers:**\n`;
      response += `Total: ${drivers.length}, Available: ${availableDrivers.length}\n`;
      
      if (userMessage.includes('best') || userMessage.includes('top')) {
        const topDrivers = drivers
          .sort((a, b) => (b.completedTrips || 0) - (a.completedTrips || 0))
          .slice(0, 3);
        
        response += `\n**Top Performers:**\n`;
        topDrivers.forEach((d, i) => {
          response += `${i + 1}. ${d.name} - ${d.completedTrips || 0} trips\n`;
        });
      } else if (availableDrivers.length > 0) {
        response += `\n**Available:**\n`;
        availableDrivers.slice(0, 3).forEach((d, i) => {
          response += `${i + 1}. ${d.name}\n`;
        });
      }
    }
    
    // Question: Fleet status, vehicles count
    else if (userMessage.includes('how many') || userMessage.includes('fleet') || userMessage.includes('status')) {
      const availableVehicles = vehicles.filter(v => v.status === 'Available');
      const inUseVehicles = vehicles.filter(v => v.status === 'In Use');
      const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance');

      response = `**Fleet Status:**\n`;
      response += `🚗 Vehicles: ${vehicles.length} (${availableVehicles.length} available, ${inUseVehicles.length} in use)\n`;
      response += `📋 Trips: ${trips.length} (${trips.filter(t => t.status === 'Completed').length} completed)`;
    }
    
    // Question: Fuel efficiency or consumption
    else if (userMessage.includes('fuel') || userMessage.includes('efficiency') || userMessage.includes('consumption')) {
      const totalFuelCost = fuelLogs.reduce((sum, log) => sum + (log.fuelCost || 0), 0);
      const totalLiters = fuelLogs.reduce((sum, log) => sum + (log.quantity || 0), 0);
      const avgPrice = totalLiters > 0 ? totalFuelCost / totalLiters : 0;

      response = `**Fuel:**\n`;
      response += `⛽ Logs: ${fuelLogs.length}, Cost: $${totalFuelCost.toFixed(2)}\n`;
      response += `📊 Total: ${totalLiters.toFixed(2)}L @ $${avgPrice.toFixed(2)}/L\n`;
      
      // Find most fuel-efficient vehicle
      const vehicleFuelData = vehicles.map(v => {
        const vehicleFuelLogs = fuelLogs.filter(f => f.vehicle && f.vehicle.toString() === v._id.toString());
        const totalCost = vehicleFuelLogs.reduce((sum, log) => sum + (log.fuelCost || 0), 0);
        return { vehicle: v, fuelCost: totalCost, logs: vehicleFuelLogs.length };
      }).filter(vfd => vfd.logs > 0).sort((a, b) => a.fuelCost - b.fuelCost);

      if (vehicleFuelData.length > 0) {
        response += `**Most Fuel Efficient:**\n${vehicleFuelData[0].vehicle.model} (${vehicleFuelData[0].vehicle.registrationNumber}) - $${vehicleFuelData[0].fuelCost.toFixed(2)} total`;
      }
    }
    
    // Question: Trip related
    else if (userMessage.includes('trip')) {
      const completedTrips = trips.filter(t => t.status === 'Completed');
      const inProgressTrips = trips.filter(t => t.status === 'In Progress');
      const totalRevenue = completedTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
      const avgRevenue = completedTrips.length > 0 ? totalRevenue / completedTrips.length : 0;

      response = `**Trip Summary:**\n\n`;
      response += `📍 Total: ${trips.length} trips\n`;
      response += `✅ Completed: ${completedTrips.length}\n`;
      response += `🔄 In Progress: ${inProgressTrips.length}\n`;
      response += `💰 Total Revenue: $${totalRevenue.toFixed(2)}\n`;
      response += `📊 Average/Trip: $${avgRevenue.toFixed(2)}`;
    }
    
    // Default: Try to give a helpful response based on context
    else {
      // If asking about general questions, try to be helpful with fleet context
      if (userMessage.includes('how') || userMessage.includes('what') || userMessage.includes('when') || userMessage.includes('why') || userMessage.includes('who') || userMessage.includes('where')) {
        // Check if it's fleet-related
        const hasFleetKeywords = userMessage.includes('vehicle') || userMessage.includes('driver') || 
                                  userMessage.includes('trip') || userMessage.includes('fleet') ||
                                  userMessage.includes('maintenance') || userMessage.includes('fuel') ||
                                  userMessage.includes('expense') || userMessage.includes('cost') ||
                                  userMessage.includes('profit') || userMessage.includes('revenue');
        
        if (hasFleetKeywords) {
          // Generic fleet info
          response = `I can help with that! Your fleet has ${vehicles.length} vehicles, ${drivers.length} drivers, and ${trips.length} trips recorded. Ask me about specific vehicles, costs, drivers, or maintenance.`;
        } else {
          // General question - be conversational
          response = `I'm primarily designed to help with FleetFlow fleet management. I can answer questions about your vehicles, drivers, trips, expenses, and maintenance. Try asking about your fleet status, costs, or vehicle recommendations!`;
        }
      } else {
        // Very general - just be friendly
        response = `I'm here to help with your FleetFlow fleet management! Ask me about vehicles, drivers, expenses, trips, or maintenance.`;
      }
    }

    res.json({
      success: true,
      response: response,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      message: error.message
    });
  }
});

module.exports = router;
