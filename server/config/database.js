const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/govconnect';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB Disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB Error:', error);
});

module.exports = connectDB;