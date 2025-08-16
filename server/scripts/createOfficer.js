const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
require('dotenv').config();

const createOfficerUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/govconnect');
    console.log('✅ Connected to database');

    // Get or create a department first
    let department = await Department.findOne({ code: 'DMT' });
    if (!department) {
      department = new Department({
        name: 'Department of Motor Traffic',
        code: 'DMT',
        description: 'Government department responsible for motor vehicle registration, licensing, and traffic management.',
        location: {
          address: '123 Galle Road',
          city: 'Colombo',
          district: 'Colombo',
          province: 'Western Province',
          postalCode: '00300'
        },
        contactInfo: {
          phone: '+94112345678',
          email: 'info@dmt.gov.lk',
          website: 'https://dmt.gov.lk'
        },
        workingHours: {
          monday: { open: '08:00', close: '16:30' },
          tuesday: { open: '08:00', close: '16:30' },
          wednesday: { open: '08:00', close: '16:30' },
          thursday: { open: '08:00', close: '16:30' },
          friday: { open: '08:00', close: '16:30' },
          saturday: { open: '08:00', close: '12:30' },
          sunday: { open: null, close: null }
        },
        isActive: true
      });
      await department.save();
      console.log('✅ Department created:', department.name);
    }

    // Check if officer already exists
    const existingOfficer = await User.findOne({ email: 'officer@govconnect.lk' });
    if (existingOfficer) {
      console.log('⚠️ Officer user already exists');
      console.log('Email:', existingOfficer.email);
      return;
    }

    // Create officer user
    const hashedPassword = await bcrypt.hash('officer123', 10);
    const officerUser = new User({
      firstName: 'John',
      lastName: 'Officer',
      email: 'officer@govconnect.lk',
      password: hashedPassword,
      nic: '901234567V',
      phoneNumber: '+94112345679',
      role: 'officer',
      department: department._id,
      isVerified: true,
      address: {
        street: 'Officer Street',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western Province',
        postalCode: '00300'
      }
    });

    await officerUser.save();
    console.log('✅ Officer user created successfully!');
    console.log('Email: officer@govconnect.lk');
    console.log('Password: officer123');
    console.log('Role: officer');
    console.log('Department:', department.name);

    // Create another officer for testing
    const existingOfficer2 = await User.findOne({ email: 'officer2@govconnect.lk' });
    if (!existingOfficer2) {
      const hashedPassword2 = await bcrypt.hash('officer123', 10);
      const officerUser2 = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'officer2@govconnect.lk',
        password: hashedPassword2,
        nic: '902345678V',
        phoneNumber: '+94112345680',
        role: 'officer',
        department: department._id,
        isVerified: true,
        address: {
          street: 'Officer Street 2',
          city: 'Colombo',
          district: 'Colombo',
          province: 'Western Province',
          postalCode: '00300'
        }
      });

      await officerUser2.save();
      console.log('✅ Second officer user created successfully!');
      console.log('Email: officer2@govconnect.lk');
      console.log('Password: officer123');
      console.log('Role: officer');
      console.log('Department:', department.name);
    }

  } catch (error) {
    console.error('❌ Error creating officer user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

createOfficerUser();
