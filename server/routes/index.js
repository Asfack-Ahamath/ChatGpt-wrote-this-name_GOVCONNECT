const express = require('express');
const router = express.Router();

// Import route modules (add as needed)
// const authRoutes = require('./auth');
// const userRoutes = require('./users');

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
      // Add more endpoints as they are created
    }
  });
});

// Mount route modules (uncomment as needed)
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

module.exports = router;
