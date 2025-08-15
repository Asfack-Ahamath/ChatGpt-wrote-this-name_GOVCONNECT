const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const departmentRoutes = require('./departments');
const serviceRoutes = require('./services');
const appointmentRoutes = require('./appointments');
const adminRoutes = require('./admin');
const officerRoutes = require('./officer');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info route
router.get('/', (req, res) => {
  res.json({
    message: 'GOVCONNECT API v1.0',
    documentation: '/api/docs', // Future documentation endpoint
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      departments: '/api/departments',
      services: '/api/services',
      appointments: '/api/appointments',
      admin: '/api/admin',
      officer: '/api/officer'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);
router.use('/officer', officerRoutes);

module.exports = router;
