// Bypass TLS cert validation for MongoDB Atlas (development only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
// Data populate route added
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const fuelLogRoutes = require('./routes/fuelLogRoutes');
const maintenanceLogRoutes = require('./routes/maintenanceLogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const exportRoutes = require('./routes/exportRoutes');
const populateRoutes = require('./routes/populate');
const chatbotRoutes = require('./routes/chatbot');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io for real-time updates
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost port for development
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    // Allow configured frontend URL
    const allowed = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (origin === allowed) return callback(null, true);
    callback(new Error('CORS: Origin not allowed: ' + origin));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// DB readiness guard — return 503 with clear message if MongoDB not yet connected
const mongoose = require('mongoose');
app.use((req, res, next) => {
  if (req.path === '/api/health') return next(); // always allow health check
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database not ready yet — please wait a few seconds and retry'
    });
  }
  next();
});

// Make io accessible to routes via middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Make io accessible in routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/fuel-logs', fuelLogRoutes);
app.use('/api/maintenance-logs', maintenanceLogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', populateRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FleetFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 FleetFlow Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.io enabled for real-time updates`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`⚠️  Warning: ${err.message}`);
  console.log('Server will continue running for development');
  // Don't exit in development mode if only DB connection fails
  // server.close(() => process.exit(1));
});

module.exports = { app, io };
