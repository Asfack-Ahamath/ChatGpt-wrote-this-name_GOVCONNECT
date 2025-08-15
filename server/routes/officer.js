const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');

// Middleware to check if user is officer or admin
const requireOfficer = (req, res, next) => {
  if (!['officer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Officer or admin access required' });
  }
  next();
};

// Get officer dashboard stats
router.get('/stats', [auth, requireOfficer], async (req, res) => {
  try {
    let query = {};
    
    // If officer, only show their department's appointments
    if (req.user.role === 'officer') {
      query.department = req.user.department;
    }

    const [appointments, services] = await Promise.all([
      Appointment.find(query),
      Service.find(req.user.role === 'officer' ? { department: req.user.department } : {})
    ]);

    // Count appointments by status
    const appointmentStats = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today && aptDate < tomorrow;
    });

    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today && aptDate <= nextWeek && ['pending', 'confirmed'].includes(apt.status);
    });

    const stats = {
      totalAppointments: appointments.length,
      pendingAppointments: appointmentStats.pending || 0,
      confirmedAppointments: appointmentStats.confirmed || 0,
      completedAppointments: appointmentStats.completed || 0,
      cancelledAppointments: appointmentStats.cancelled || 0,
      todayAppointments: todayAppointments.length,
      upcomingAppointments: upcomingAppointments.length,
      totalServices: services.length,
      departmentName: req.user.department ? (await Department.findById(req.user.department))?.name : 'All Departments'
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching officer stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get appointments for officer management
router.get('/appointments', [auth, requireOfficer], async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20, search } = req.query;
    let query = {};
    
    // If officer, only show their department's appointments
    if (req.user.role === 'officer') {
      query.department = req.user.department;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.appointmentDate = {
        $gte: selectedDate,
        $lt: nextDay
      };
    }

    let appointmentsQuery = Appointment.find(query)
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('service', 'name code description processingTime fees')
      .populate('department', 'name location contactInfo')
      .populate('officer', 'firstName lastName email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchQuery = {
        $or: [
          { appointmentNumber: searchRegex },
          { 'citizen.firstName': searchRegex },
          { 'citizen.lastName': searchRegex },
          { 'citizen.email': searchRegex },
          { 'service.name': searchRegex }
        ]
      };
      
      // Need to use aggregation for searching populated fields
      const appointments = await Appointment.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'citizen',
            foreignField: '_id',
            as: 'citizen'
          }
        },
        { $unwind: '$citizen' },
        {
          $lookup: {
            from: 'services',
            localField: 'service',
            foreignField: '_id',
            as: 'service'
          }
        },
        { $unwind: '$service' },
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'department'
          }
        },
        { $unwind: '$department' },
        {
          $lookup: {
            from: 'users',
            localField: 'officer',
            foreignField: '_id',
            as: 'officer'
          }
        },
        {
          $match: {
            $or: [
              { appointmentNumber: searchRegex },
              { 'citizen.firstName': searchRegex },
              { 'citizen.lastName': searchRegex },
              { 'citizen.email': searchRegex },
              { 'service.name': searchRegex }
            ]
          }
        },
        { $sort: { appointmentDate: 1, appointmentTime: 1 } },
        { $skip: (page - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      ]);

      return res.json({
        success: true,
        data: appointments,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasMore: appointments.length === parseInt(limit)
        }
      });
    }

    // Regular query without search
    const appointments = await appointmentsQuery
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: appointments,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        hasMore: appointments.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update appointment status
router.patch('/appointments/:id/status', [auth, requireOfficer], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let query = { _id: id };
    
    // If officer, only allow updating their department's appointments
    if (req.user.role === 'officer') {
      query.department = req.user.department;
    }

    const appointment = await Appointment.findOne(query);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or access denied' });
    }

    // Update appointment
    appointment.status = status;
    
    if (notes) {
      appointment.notes.officer = notes;
    }

    // Assign officer if not already assigned
    if (!appointment.officer && req.user.role === 'officer') {
      appointment.officer = req.user._id;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('service', 'name code description processingTime fees')
      .populate('department', 'name location contactInfo')
      .populate('officer', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign appointment to officer
router.patch('/appointments/:id/assign', [auth, requireOfficer], async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;

    let query = { _id: id };
    
    // If officer, only allow updating their department's appointments
    if (req.user.role === 'officer') {
      query.department = req.user.department;
    }

    const appointment = await Appointment.findOne(query);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or access denied' });
    }

    // Verify the officer exists and belongs to the same department (if current user is officer)
    if (officerId) {
      const officer = await User.findById(officerId);
      if (!officer || officer.role !== 'officer') {
        return res.status(400).json({ error: 'Invalid officer' });
      }

      if (req.user.role === 'officer' && officer.department.toString() !== req.user.department.toString()) {
        return res.status(403).json({ error: 'Can only assign officers from your department' });
      }

      appointment.officer = officerId;
    } else {
      appointment.officer = undefined;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('service', 'name code description processingTime fees')
      .populate('department', 'name location contactInfo')
      .populate('officer', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Appointment assignment updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error assigning appointment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reschedule appointment
router.patch('/appointments/:id/reschedule', [auth, requireOfficer], async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime, reason } = req.body;

    if (!newDate || !newTime || !reason) {
      return res.status(400).json({ error: 'New date, time, and reason are required' });
    }

    let query = { _id: id };
    
    // If officer, only allow updating their department's appointments
    if (req.user.role === 'officer') {
      query.department = req.user.department;
    }

    const appointment = await Appointment.findOne(query);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or access denied' });
    }

    // Check if the new slot is available
    const existingAppointment = await Appointment.findOne({
      service: appointment.service,
      appointmentDate: new Date(newDate),
      appointmentTime: newTime,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: id }
    });

    if (existingAppointment) {
      return res.status(409).json({ error: 'The new time slot is already booked' });
    }

    // Add to reschedule history
    appointment.rescheduleHistory.push({
      previousDate: appointment.appointmentDate,
      previousTime: appointment.appointmentTime,
      newDate: new Date(newDate),
      newTime: newTime,
      reason: reason,
      rescheduledBy: req.user._id
    });

    // Update appointment
    appointment.appointmentDate = new Date(newDate);
    appointment.appointmentTime = newTime;
    appointment.status = 'rescheduled';

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('service', 'name code description processingTime fees')
      .populate('department', 'name location contactInfo')
      .populate('officer', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get officers in department (for assignment)
router.get('/department-officers', [auth, requireOfficer], async (req, res) => {
  try {
    let query = { role: 'officer', isActive: true };
    
    // If officer, only show officers from their department
    if (req.user.role === 'officer') {
      query.department = req.user.department;
    }

    const officers = await User.find(query)
      .populate('department', 'name code')
      .select('firstName lastName email department')
      .sort({ firstName: 1 });

    res.json({
      success: true,
      data: officers
    });
  } catch (error) {
    console.error('Error fetching department officers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get appointment details
router.get('/appointments/:id', [auth, requireOfficer], async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = { _id: id };
    
    // If officer, only allow viewing their department's appointments
    if (req.user.role === 'officer') {
      query.department = req.user.department;
    }

    const appointment = await Appointment.findOne(query)
      .populate('citizen', 'firstName lastName email phoneNumber nic address')
      .populate('service', 'name code description processingTime fees requiredDocuments')
      .populate('department', 'name location contactInfo')
      .populate('officer', 'firstName lastName email')
      .populate('rescheduleHistory.rescheduledBy', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or access denied' });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add officer notes to appointment
router.patch('/appointments/:id/notes', [auth, requireOfficer], async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, internal } = req.body;

    let query = { _id: id };
    
    // If officer, only allow updating their department's appointments
    if (req.user.role === 'officer') {
      query.department = req.user.department;
    }

    const appointment = await Appointment.findOne(query);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or access denied' });
    }

    if (notes !== undefined) {
      appointment.notes.officer = notes;
    }
    
    if (internal !== undefined) {
      appointment.notes.internal = internal;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('citizen', 'firstName lastName email phoneNumber nic')
      .populate('service', 'name code description processingTime fees')
      .populate('department', 'name location contactInfo')
      .populate('officer', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Notes updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment notes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
