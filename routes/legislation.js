const express = require('express');
const router = express.Router();
const Legislation = require('../models/Legislation');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// Get all legislations with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = new RegExp(req.query.category, 'i');
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const total = await Legislation.countDocuments(filter);
    const legislations = await Legislation.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ effectiveDate: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      data: legislations,
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

// Get single legislation by ID
router.get('/:id', async (req, res) => {
  try {
    const legislation = await Legislation.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('relatedLegislations', 'title type effectiveDate');

    if (!legislation || !legislation.isPublished) {
      return res.status(404).json({ status: 'error', message: 'Legislation not found' });
    }

    res.status(200).json({
      status: 'success',
      data: legislation
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create legislation
router.post('/', async (req, res) => {
  try {
    const legislation = new Legislation(req.body);
    await legislation.save();
    res.status(201).json({
      status: 'success',
      message: 'Legislation created successfully',
      data: legislation
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Update legislation
router.put('/:id', async (req, res) => {
  try {
    const legislation = await Legislation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!legislation) {
      return res.status(404).json({ status: 'error', message: 'Legislation not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Legislation updated successfully',
      data: legislation
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Delete legislation
router.delete('/:id', async (req, res) => {
  try {
    const legislation = await Legislation.findByIdAndDelete(req.params.id);
    if (!legislation) {
      return res.status(404).json({ status: 'error', message: 'Legislation not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Legislation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;