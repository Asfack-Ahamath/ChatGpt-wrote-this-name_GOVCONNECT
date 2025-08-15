// Configuration file for GOVCONNECT Server
module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration (to be added when implementing database)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'govconnect',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || ''
  },
  
  // JWT configuration (to be added when implementing authentication)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // CORS configuration
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000'],
    credentials: true
  }
};
