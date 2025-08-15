const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createNewAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/govconnect');
    console.log('✅ Connected to MongoDB');

    const newAdmin = new User({
      email: 'admin@govconnect.com',
      password: await bcrypt.hash('Admin@1234', 10),
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin',
      isVerified: true,
      nic: '0000000000'
    });

    await newAdmin.save();
    console.log('✅ New admin created successfully!');
    console.log('📋 Login credentials:');
    console.log('   Email: admin@govconnect.com');
    console.log('   Password: Admin@1234');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Troubleshooting:');
    console.log('1. Check MongoDB is running (netstat -ano | findstr 27017)');
    console.log('2. Verify the User model exists at ./models/User.js');
  } finally {
    await mongoose.disconnect();
  }
}

createNewAdmin();