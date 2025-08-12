const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const config = require('./config');

// Load environment variables
dotenv.config();

// Import routes
const apiRoutes = require('./routes');

const app = express();
const PORT = config.port;

console.log('Starting server setup...');
console.log('Port:', PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to GOVCONNECT API',
    status: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Test route working',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GOVCONNECT Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
