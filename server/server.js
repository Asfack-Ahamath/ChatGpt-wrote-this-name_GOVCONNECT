const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

// Load environment variables FIRST
dotenv.config();

const config = require('./config');
const connectDB = require('./config/database');

// Connect to database
connectDB();

// Import routes
const apiRoutes = require('./routes');

const app = express();
const PORT = config.port;

console.log('Starting server setup...');
console.log('Port:', PORT);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`🔵 [${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const body = { ...req.body };
    // Remove sensitive fields from logs
    if (body.password) body.password = '[HIDDEN]';
    if (body.token) body.token = '[HIDDEN]';
    console.log(`📝 Request Body:`, JSON.stringify(body, null, 2));
  }
  
  // Log query parameters
  if (Object.keys(req.query).length > 0) {
    console.log(`🔍 Query Params:`, JSON.stringify(req.query, null, 2));
  }
  
  // Log response when it finishes
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    console.log(`🟢 [${timestamp}] ${method} ${url} - Status: ${res.statusCode} - Time: ${responseTime}ms`);
    
    // Log error responses
    if (res.statusCode >= 400) {
      console.log(`❌ Error Response:`, data);
    }
    
    originalSend.call(this, data);
  };
  
  req.startTime = Date.now();
  next();
});

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'GOVCONNECT API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
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
