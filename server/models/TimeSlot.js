const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  maxAppointments: {
    type: Number,
    default: 1
  },
  currentAppointments: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: String,
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }]
}, {
  timestamps: true
});

timeSlotSchema.index({ date: 1, startTime: 1, department: 1, service: 1 });

timeSlotSchema.virtual('isFullyBooked').get(function() {
  return this.currentAppointments >= this.maxAppointments;
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema);