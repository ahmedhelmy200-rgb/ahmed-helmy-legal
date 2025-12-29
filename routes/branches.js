const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// Get all branches with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.city) filter['location.city'] = new RegExp(req.query.city, 'i');
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const total = await Branch.countDocuments(filter);
    const branches = await Branch.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      status: 'success',
      data: branches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get single branch by ID
router.get('/:id', async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch || !branch.isPublished) {
      return res.status(404).json({ status: 'error', message: 'Branch not found' });
    }

    res.status(200).json({
      status: 'success',
      data: branch
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get branch by code
router.get('/code/:code', async (req, res) => {
  try {
    const branch = await Branch.findOne({ code: req.params.code.toUpperCase() });

    if (!branch || !branch.isPublished) {
      return res.status(404).json({ status: 'error', message: 'Branch not found' });
    }

    res.status(200).json({
      status: 'success',
      data: branch
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create branch
router.post('/', async (req, res) => {
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json({
      status: 'success',
      message: 'Branch created successfully',
      data: branch
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Update branch
router.put('/:id', async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!branch) {
      return res.status(404).json({ status: 'error', message: 'Branch not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Branch updated successfully',
      data: branch
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Delete branch
router.delete('/:id', async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      return res.status(404).json({ status: 'error', message: 'Branch not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get branches by city
router.get('/city/:city', async (req, res) => {
  try {
    const branches = await Branch.find({
      'location.city': new RegExp(req.params.city, 'i'),
      isPublished: true
    }).lean();

    res.status(200).json({
      status: 'success',
      data: branches
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;