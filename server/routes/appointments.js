const express = require('express');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const TimeSlot = require('../models/TimeSlot');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

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

module.exports = router;