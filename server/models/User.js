const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nic: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^(\d{9}[vVxX]|\d{12})$/.test(v);
      },
      message: 'Invalid NIC format'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(?:0|94|\+94)?[1-9]\d{8}$/.test(v);
      },
      message: 'Invalid Sri Lankan phone number'
    }
  },
  address: {
    street: String,
    city: String,
    district: String,
    province: String,
    postalCode: String
  },
  dateOfBirth: Date,
  role: {
    type: String,
    enum: ['citizen', 'officer', 'admin'],
    default: 'citizen'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() {
      return this.role === 'officer';
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: String,
  preferences: {
    language: {
      type: String,
      enum: ['english', 'sinhala', 'tamil'],
      default: 'english'
    },
    notificationMethod: {
      type: String,
      enum: ['email', 'sms', 'both'],
      default: 'email'
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);