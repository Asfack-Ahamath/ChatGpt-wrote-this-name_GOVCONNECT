const express = require('express');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, category, department } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameInSinhala: { $regex: search, $options: 'i' } },
        { nameInTamil: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (department) {
      query.department = department;
    }

    const services = await Service.find(query)
      .populate('department', 'name code location.city')
      .select('-__v')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Server error while fetching services' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Service.distinct('category', { isActive: true });
    
    const categoryLabels = {
      'license_permits': 'Licenses & Permits',
      'certificates': 'Certificates',
      'registration': 'Registration',
      'applications': 'Applications',
      'renewals': 'Renewals',
      'verification': 'Verification',
      'other': 'Other Services'
    };

    const categoriesWithLabels = categories.map(cat => ({
      value: cat,
      label: categoryLabels[cat] || cat
    }));

    res.json({
      success: true,
      data: categoriesWithLabels
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error while fetching categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('department')
      .select('-__v');
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Server error while fetching service' });
  }
});

module.exports = router;