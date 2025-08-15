const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentNumber: {
    type: String,
    unique: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
      'rescheduled'
    ],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    documentType: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationNotes: String
  }],
  qrCode: String,
  notes: {
    citizen: String,
    officer: String,
    internal: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'system']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed']
    },
    message: String
  }],
  cancellationReason: String,
  rescheduleHistory: [{
    previousDate: Date,
    previousTime: String,
    newDate: Date,
    newTime: String,
    reason: String,
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduledAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

appointmentSchema.pre('save', function(next) {
  if (this.isNew && !this.appointmentNumber) {
    const prefix = 'GC';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.appointmentNumber = `${prefix}${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);