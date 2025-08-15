const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('nic')
    .matches(/^(\d{9}[vVxX]|\d{12})$/)
    .withMessage('Invalid NIC format'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('phoneNumber')
    .matches(/^(?:0|94|\+94)?[1-9]\d{8}$/)
    .withMessage('Invalid Sri Lankan phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nic, email, password, firstName, lastName, phoneNumber, address, dateOfBirth } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { nic }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email or NIC'
      });
    }

    const user = new User({
      nic,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      address,
      dateOfBirth
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        nic: user.nic,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', [
  body('identifier')
    .notEmpty()
    .withMessage('NIC or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { nic: identifier }]
    }).populate('department');

    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        nic: user.nic,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        isVerified: user.isVerified,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        nic: req.user.nic,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phoneNumber: req.user.phoneNumber,
        role: req.user.role,
        department: req.user.department,
        isVerified: req.user.isVerified,
        preferences: req.user.preferences,
        address: req.user.address
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', auth, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phoneNumber').optional().matches(/^(?:0|94|\+94)?[1-9]\d{8}$/).withMessage('Invalid phone number'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'address', 'preferences'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password').populate('department');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
});

module.exports = router;