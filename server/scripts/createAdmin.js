const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/govconnect');
    console.log('✅ Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Password: (check your records)');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@govconnect.lk',
      password: hashedPassword,
      nic: 'ADMIN001',
      phoneNumber: '+94112345678',
      role: 'admin',
      isVerified: true,
      address: {
        street: 'Admin Street',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western Province'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@govconnect.lk');
    console.log('Password: admin123');
    console.log('Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

createAdminUser();