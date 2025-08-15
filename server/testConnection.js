const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect('mongodb://127.0.0.1:27017');
    console.log('✅ Successfully connected to MongoDB');
    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
