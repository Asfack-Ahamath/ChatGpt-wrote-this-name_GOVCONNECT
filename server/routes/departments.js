const express = require('express');
const Department = require('../models/Department');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, province, district } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameInSinhala: { $regex: search, $options: 'i' } },
        { nameInTamil: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (province) {
      query['location.province'] = province;
    }

    if (district) {
      query['location.district'] = district;
    }

    const departments = await Department.find(query)
      .select('-__v')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Server error while fetching departments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const services = await Service.find({ 
      department: department._id, 
      isActive: true 
    }).select('-__v');

    res.json({
      success: true,
      data: {
        department,
        services
      }
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Server error while fetching department' });
  }
});

router.get('/:id/services', async (req, res) => {
  try {
    const { category } = req.query;
    let query = { 
      department: req.params.id, 
      isActive: true 
    };

    if (category) {
      query.category = category;
    }

    const services = await Service.find(query)
      .populate('department', 'name code')
      .select('-__v')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get department services error:', error);
    res.status(500).json({ error: 'Server error while fetching services' });
  }
});

module.exports = router;