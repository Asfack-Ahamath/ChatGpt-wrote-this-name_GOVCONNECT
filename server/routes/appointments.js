const express = require('express');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const TimeSlot = require('../models/TimeSlot');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all appointments (for analytics/admin use)
router.get('/', auth, async (req, res) => {
  try {
    // Only allow admin and officers to see all appointments
    if (req.user.role !== 'admin' && req.user.role !== 'officer') {
      return res.status(403).json({ error: 'Access denied. Only admin or officers can view all appointments.' });
    }

    const { status, department, limit = 100, page = 1 } = req.query;

    let query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by department if provided
    if (department) {
      query.department = department;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(query)
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('service', 'name code processingTime fees')
      .populate('department', 'name code')
      .populate('officer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalCount = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
});

router.get('/available-slots', auth, async (req, res) => {
  try {
    const { serviceId, date, departmentId } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        error: 'Service ID and date are required'
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        error: 'Cannot book appointments for past dates'
      });
    }

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + service.maxAdvanceBookingDays);

    if (selectedDate > maxDate) {
      return res.status(400).json({
        error: `Cannot book appointments more than ${service.maxAdvanceBookingDays} days in advance`
      });
    }

    const dayOfWeek = selectedDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    const department = await service.populate('department');
    const workingHours = department.department.workingHours[dayName];

    if (!workingHours || !workingHours.start || !workingHours.end) {
      return res.json({
        success: true,
        data: {
          availableSlots: [],
          message: 'No working hours on this day'
        }
      });
    }

    const slots = generateTimeSlots(workingHours.start, workingHours.end, service.appointmentDuration);

    const existingAppointments = await Appointment.find({
      service: serviceId,
      appointmentDate: {
        $gte: selectedDate,
        $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedTimes = existingAppointments.map(apt => apt.appointmentTime);
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot.time));

    res.json({
      success: true,
      data: {
        availableSlots,
        workingHours,
        totalSlots: slots.length,
        availableCount: availableSlots.length
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Server error while fetching available slots' });
  }
});

router.post('/book', auth, [
  body('serviceId').notEmpty().withMessage('Service ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
  body('notes.citizen').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceId, appointmentDate, appointmentTime, notes } = req.body;

    const service = await Service.findById(serviceId).populate('department');
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const existingAppointment = await Appointment.findOne({
      service: serviceId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        error: 'This time slot is already booked'
      });
    }

    const appointment = new Appointment({
      citizen: req.user._id,
      service: serviceId,
      department: service.department._id,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      notes: {
        citizen: notes?.citizen || ''
      }
    });

    // Save appointment first to generate appointmentNumber
    await appointment.save();

    const qrData = {
      appointmentNumber: appointment.appointmentNumber,
      citizen: `${req.user.firstName} ${req.user.lastName}`,
      service: service.name,
      department: service.department.name,
      date: appointmentDate,
      time: appointmentTime
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    appointment.qrCode = qrCodeDataURL;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('service', 'name code description processingTime fees')
      .populate('department', 'name location contactInfo')
      .populate('citizen', 'firstName lastName email phoneNumber nic');

    // Send confirmation email
    let notificationStatus = 'sent';
    let notificationMessage = 'Appointment confirmation email';
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Use true for port 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: populatedAppointment.citizen.email,
        subject: `Appointment Confirmation: ${populatedAppointment.appointmentNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333;">Appointment Confirmed!</h2>
            <p>Dear ${populatedAppointment.citizen.firstName} ${populatedAppointment.citizen.lastName},</p>
            <p>Your appointment has been successfully booked. Here are the details:</p>
            <ul>
              <li><strong>Appointment Number:</strong> ${populatedAppointment.appointmentNumber}</li>
              <li><strong>Service:</strong> ${populatedAppointment.service.name}</li>
              <li><strong>Date:</strong> ${new Date(populatedAppointment.appointmentDate).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${populatedAppointment.appointmentTime}</li>
              <li><strong>Department:</strong> ${populatedAppointment.department.name}</li>
              <li><strong>Location:</strong> ${populatedAppointment.department.location.address}, ${populatedAppointment.department.location.city}</li>
              <li><strong>Fee:</strong> LKR ${populatedAppointment.service.fees.amount.toLocaleString()}</li>
            </ul>
            <p><strong>QR Code for Check-in:</strong></p>
            <img src="${populatedAppointment.qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
            <p>Please bring all required documents as listed in the service details. You'll receive a reminder 24 hours before your appointment.</p>
            <p>If you need to cancel or reschedule, log in to your dashboard.</p>
            <p>Thank you,<br>Government Services Portal</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      notificationStatus = 'failed';
      notificationMessage = `Appointment confirmation email failed: ${emailError.message}`;
    }

    // Log the notification in the schema
    populatedAppointment.notifications.push({
      type: 'email',
      sentAt: new Date(),
      status: notificationStatus,
      message: notificationMessage
    });
    await populatedAppointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.message
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate booking detected'
      });
    }

    res.status(500).json({
      error: 'Server error while booking appointment',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/my-appointments', auth, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    let query = { citizen: req.user._id };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.appointmentDate = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    }

    const appointments = await Appointment.find(query)
      .populate('service', 'name code description processingTime fees')
      .populate('department', 'name location contactInfo')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ error: 'Server error while fetching appointments' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service')
      .populate('department')
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('officer', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.citizen._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'officer' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Server error while fetching appointment' });
  }
});

router.put('/:id/cancel', auth, [
  body('cancellationReason').notEmpty().withMessage('Cancellation reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        error: 'Can only cancel pending or confirmed appointments'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.cancellationReason;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Server error while cancelling appointment' });
  }
});

// Update appointment status (for admin/officer)
router.patch('/:id', auth, [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
  body('notes.officer').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only admin and officers can update appointment status
    if (req.user.role !== 'admin' && req.user.role !== 'officer') {
      return res.status(403).json({ error: 'Access denied. Only admin or officers can update appointment status' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { status, notes } = req.body;

    // Update appointment
    appointment.status = status;

    // If officer notes provided, update them
    if (notes && notes.officer) {
      appointment.notes.officer = notes.officer;
    }

    // If status is being changed to confirmed/completed, assign the officer
    if (['confirmed', 'completed'].includes(status) && req.user.role === 'officer') {
      appointment.officer = req.user._id;
    }

    // Save the updated appointment
    await appointment.save();

    // Return the updated appointment with populated fields
    const updatedAppointment = await Appointment.findById(req.params.id)
      .populate('service', 'name code description processingTime fees')
      .populate('department', 'name code')
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('officer', 'firstName lastName');

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Server error while updating appointment' });
  }
});

function generateTimeSlots(startTime, endTime, duration) {
  const slots = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  let current = start;
  while (current + duration <= end) {
    const timeStr = formatTime(current);
    const endTimeStr = formatTime(current + duration);

    slots.push({
      time: timeStr,
      endTime: endTimeStr,
      display: `${timeStr} - ${endTimeStr}`
    });

    current += duration;
  }

  return slots;
}

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Submit feedback for completed appointment
router.post('/:id/feedback', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment too long (max 1000 characters)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const appointmentId = req.params.id;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if the user is the citizen who booked the appointment
    if (appointment.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only provide feedback for your own appointments.' });
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ error: 'Feedback can only be submitted for completed appointments' });
    }

    // Check if feedback already exists
    if (appointment.feedback && appointment.feedback.rating) {
      return res.status(400).json({ error: 'Feedback has already been submitted for this appointment' });
    }

    // Add feedback
    appointment.feedback = {
      rating: parseInt(rating),
      comment: comment || '',
      submittedAt: new Date()
    };

    await appointment.save();

    // Return updated appointment with populated fields
    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate('service', 'name code description processingTime fees')
      .populate('department', 'name location contactInfo')
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('officer', 'firstName lastName');

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      error: 'Server error while submitting feedback',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get feedback statistics (for admin/analytics)
router.get('/feedback/stats', auth, async (req, res) => {
  try {
    // Only allow admin and officers to view feedback stats
    if (req.user.role !== 'admin' && req.user.role !== 'officer') {
      return res.status(403).json({ error: 'Access denied. Only admin or officers can view feedback statistics.' });
    }

    const { department, service, startDate, endDate } = req.query;

    // Build match query
    let matchQuery = {
      'feedback.rating': { $exists: true, $ne: null },
      status: 'completed'
    };

    if (department) {
      matchQuery.department = mongoose.Types.ObjectId(department);
    }

    if (service) {
      matchQuery.service = mongoose.Types.ObjectId(service);
    }

    if (startDate || endDate) {
      matchQuery.appointmentDate = {};
      if (startDate) {
        matchQuery.appointmentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.appointmentDate.$lte = new Date(endDate);
      }
    }

    const stats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: '$feedback.rating' },
          ratingDistribution: {
            $push: '$feedback.rating'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalFeedbacks: 1,
          averageRating: { $round: ['$averageRating', 2] },
          ratingDistribution: {
            rating1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } },
            rating2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
            rating3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
            rating4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
            rating5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } }
          }
        }
      }
    ]);

    // Get service-wise feedback
    const serviceStats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$service',
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: '$feedback.rating' }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      {
        $project: {
          serviceName: { $arrayElemAt: ['$serviceInfo.name', 0] },
          totalFeedbacks: 1,
          averageRating: { $round: ['$averageRating', 2] }
        }
      },
      { $sort: { averageRating: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalFeedbacks: 0,
          averageRating: 0,
          ratingDistribution: { rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 }
        },
        byService: serviceStats
      }
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      error: 'Server error while fetching feedback statistics',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get recent feedback (for admin dashboard)
router.get('/feedback/recent', auth, async (req, res) => {
  try {
    // Only allow admin and officers to view recent feedback
    if (req.user.role !== 'admin' && req.user.role !== 'officer') {
      return res.status(403).json({ error: 'Access denied. Only admin or officers can view feedback.' });
    }

    const { limit = 10, department } = req.query;

    let matchQuery = {
      'feedback.rating': { $exists: true, $ne: null },
      status: 'completed'
    };

    if (department) {
      matchQuery.department = mongoose.Types.ObjectId(department);
    }

    const recentFeedback = await Appointment.find(matchQuery)
      .populate('citizen', 'firstName lastName')
      .populate('service', 'name')
      .populate('department', 'name')
      .populate('officer', 'firstName lastName')
      .sort({ 'feedback.submittedAt': -1 })
      .limit(parseInt(limit))
      .select('appointmentNumber feedback appointmentDate');

    res.json({
      success: true,
      data: recentFeedback
    });
  } catch (error) {
    console.error('Get recent feedback error:', error);
    res.status(500).json({
      error: 'Server error while fetching recent feedback',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;