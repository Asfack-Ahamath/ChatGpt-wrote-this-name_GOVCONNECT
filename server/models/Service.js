const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nameInSinhala: String,
  nameInTamil: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  category: {
    type: String,
    enum: [
      'license_permits',
      'certificates',
      'registration',
      'applications',
      'renewals',
      'verification',
      'other'
    ],
    required: true
  },
  requiredDocuments: [{
    name: String,
    description: String,
    isMandatory: Boolean,
    acceptedFormats: [String]
  }],
  processingTime: {
    estimatedDays: Number,
    description: String
  },
  fees: {
    amount: Number,
    currency: {
      type: String,
      default: 'LKR'
    },
    description: String
  },
  appointmentDuration: {
    type: Number,
    default: 30,
    required: true
  },
  maxAdvanceBookingDays: {
    type: Number,
    default: 30,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  instructions: String,
  prerequisites: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);