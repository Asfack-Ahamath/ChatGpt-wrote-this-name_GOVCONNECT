const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  nameInSinhala: String,
  nameInTamil: String,
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  location: {
    address: String,
    city: String,
    district: String,
    province: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  workingHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);