const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get admin dashboard stats
router.get('/stats', [auth, requireAdmin], async (req, res) => {
  try {
    const [users, appointments, departments, services] = await Promise.all([
      User.find(),
      Appointment.find(),
      Department.find(),
      Service.find()
    ]);

    // Count users by role
    const userStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Count pending appointments
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

    const stats = {
      totalUsers: users.length,
      totalAppointments: appointments.length,
      pendingAppointments,
      totalDepartments: departments.length,
      totalServices: services.length,
      admins: userStats.admin || 0,
      officers: userStats.officer || 0,
      citizens: userStats.citizen || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin and officer focus)
router.get('/users', [auth, requireAdmin], async (req, res) => {
  try {
    const users = await User.find()
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new admin/officer user
router.post('/users', [auth, requireAdmin], async (req, res) => {
  try {
    const {
      nic,
      email,
      firstName,
      lastName,
      phoneNumber,
      role,
      password,
      department
    } = req.body;

    // Validate required fields
    if (!nic || !email || !firstName || !lastName || !phoneNumber || !role || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    if (!['admin', 'officer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { nic }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or NIC already exists' });
    }

    // Validate NIC format (Sri Lankan)
    const nicRegex = /^(\d{9}[vVxX]|\d{12})$/;
    if (!nicRegex.test(nic)) {
      return res.status(400).json({ error: 'Invalid NIC format' });
    }

    // Validate phone number (Sri Lankan)
    const phoneRegex = /^(0\d{9})$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Create user (password will be hashed automatically by User model pre-save hook)
    const userData = {
      nic,
      email,
      firstName,
      lastName,
      phoneNumber,
      role,
      password, // Don't hash here - let the User model do it
      isVerified: true, // Admin-created users are auto-verified
      preferences: {
        language: 'english',
        notificationMethod: 'email'
      }
    };

    // Add department for officers
    if (role === 'officer' && department) {
      userData.department = department;
    }

    const user = new User(userData);
    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id)
      .populate('department', 'name code')
      .select('-password');

    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:userId/status', [auth, requireAdmin], async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).populate('department', 'name code').select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', [auth, requireAdmin], async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user details
router.patch('/users/:userId', [auth, requireAdmin], async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.nic; // NIC cannot be changed
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).populate('department', 'name code').select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get system activity logs (placeholder for future implementation)
router.get('/activity-logs', [auth, requireAdmin], async (req, res) => {
  try {
    // This would typically come from a separate ActivityLog model
    const mockLogs = [
      {
        id: 1,
        action: 'user_registration',
        description: 'New user registration: John Doe',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        severity: 'info'
      },
      {
        id: 2,
        action: 'appointment_completed',
        description: 'Appointment completed: DMT License Renewal',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        severity: 'success'
      },
      {
        id: 3,
        action: 'service_added',
        description: 'New service added: Marriage Certificate',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        severity: 'info'
      }
    ];

    res.json({
      success: true,
      data: mockLogs
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Special setup route for initial admin registration (no auth required)
router.post('/setup', async (req, res) => {
  try {
    const {
      nic,
      email,
      firstName,
      lastName,
      phoneNumber,
      role,
      password,
      department,
      setupKey
    } = req.body;

    // Check setup key for security (optional - you can remove this if not needed)
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY || 'govconnect-setup-2024';
    if (setupKey && setupKey !== expectedSetupKey) {
      return res.status(403).json({ error: 'Invalid setup key' });
    }

    // Check if any admin users already exist (for security)
    const existingAdmins = await User.countDocuments({ role: 'admin' });
    if (existingAdmins > 0 && role === 'admin') {
      // If there are already admins, require authentication
      return res.status(403).json({ 
        error: 'Admin users already exist. Please use the authenticated admin panel to create new accounts.' 
      });
    }

    // Validate required fields
    if (!nic || !email || !firstName || !lastName || !phoneNumber || !role || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    if (!['admin', 'officer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { nic }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or NIC already exists' });
    }

    // Validate NIC format (Sri Lankan)
    const nicRegex = /^(\d{9}[vVxX]|\d{12})$/;
    if (!nicRegex.test(nic)) {
      return res.status(400).json({ error: 'Invalid NIC format' });
    }

    // Validate phone number (Sri Lankan)
    const phoneRegex = /^(0\d{9})$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Create user (password will be hashed automatically by User model pre-save hook)
    const userData = {
      nic,
      email,
      firstName,
      lastName,
      phoneNumber,
      role,
      password, // Don't hash here - let the User model do it
      isVerified: true, // Setup users are auto-verified
      preferences: {
        language: 'english',
        notificationMethod: 'email'
      }
    };

    // Add department for officers
    if (role === 'officer' && department) {
      userData.department = department;
    }

    const user = new User(userData);
    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id)
      .populate('department', 'name code')
      .select('-password');

    res.status(201).json({
      success: true,
      message: `${role === 'admin' ? 'Administrator' : 'Officer'} account created successfully`,
      data: userResponse
    });
  } catch (error) {
    console.error('Error in admin setup:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all appointments for admin
router.get('/appointments', [auth, requireAdmin], async (req, res) => {
  try {
    const { status, department, limit = 100 } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by department if provided
    if (department) {
      query.department = department;
    }
    
    const appointments = await Appointment.find(query)
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('service', 'name code processingTime fees')
      .populate('department', 'name code')
      .populate('officer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch appointments' 
    });
  }
});

// System Settings endpoints
router.get('/settings', [auth, requireAdmin], async (req, res) => {
  try {
    // This would typically come from a SystemSettings model
    // For now, we'll return mock settings data
    const settings = {
      general: {
        systemName: 'GOVCONNECT',
        systemDescription: 'Sri Lanka Government Services Portal',
        systemVersion: '1.0.0',
        systemLogo: '/assets/logo.png',
        timezone: 'Asia/Colombo',
        defaultLanguage: 'english',
        supportedLanguages: ['english', 'sinhala', 'tamil'],
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true
      },
      appointment: {
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2,
        defaultAppointmentDuration: 30,
        allowRescheduling: true,
        rescheduleLimit: 3,
        cancellationDeadlineHours: 24,
        autoConfirmAppointments: false,
        reminderNotifications: true,
        reminderHoursBefore: [24, 2]
      },
      notification: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        emailProvider: 'smtp',
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: process.env.SMTP_PORT || 587,
        smtpSecure: false,
        smtpUser: process.env.SMTP_USER || '',
        smtpPassword: '[HIDDEN]'
      },
      security: {
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireLowercase: true,
        passwordRequireNumbers: true,
        passwordRequireSymbols: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        twoFactorAuth: false,
        ipWhitelisting: false,
        auditLogging: true
      },
      backup: {
        autoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        backupLocation: 'local',
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      },
      performance: {
        cacheEnabled: true,
        cacheDuration: 300,
        compressionEnabled: true,
        rateLimiting: true,
        rateLimit: 100,
        rateLimitWindow: 15
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update system settings
router.put('/settings', [auth, requireAdmin], async (req, res) => {
  try {
    const { category, settings } = req.body;
    
    // Validate category
    const validCategories = ['general', 'appointment', 'notification', 'security', 'backup', 'performance'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid settings category' });
    }

    // In a real implementation, you would update the SystemSettings model
    // For now, we'll just return success with the updated settings
    console.log(`Updating ${category} settings:`, settings);

    // Hide sensitive information in response
    const responseSettings = { ...settings };
    if (category === 'notification' && responseSettings.smtpPassword) {
      responseSettings.smtpPassword = '[HIDDEN]';
    }

    res.json({
      success: true,
      message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`,
      data: responseSettings
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test email configuration
router.post('/settings/test-email', [auth, requireAdmin], async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ error: 'Test email address is required' });
    }

    // In a real implementation, you would send a test email
    console.log(`Sending test email to: ${testEmail}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// System backup endpoints
router.post('/settings/backup', [auth, requireAdmin], async (req, res) => {
  try {
    // In a real implementation, you would create a system backup
    console.log('Creating system backup...');
    
    // Simulate backup creation delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const backup = {
      id: Date.now().toString(),
      filename: `govconnect-backup-${new Date().toISOString().split('T')[0]}.sql`,
      size: '2.3 MB',
      createdAt: new Date(),
      type: 'manual'
    };

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: backup
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Get system info
router.get('/settings/system-info', [auth, requireAdmin], async (req, res) => {
  try {
    const systemInfo = {
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      },
      database: {
        status: 'connected',
        host: process.env.MONGODB_URI ? 'MongoDB Atlas' : 'localhost',
        collections: 5 // This would be dynamic in a real implementation
      },
      application: {
        name: 'GOVCONNECT',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        startTime: new Date(Date.now() - process.uptime() * 1000)
      }
    };

    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;