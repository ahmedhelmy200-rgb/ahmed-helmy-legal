const express = require('express');
const router = express.Router();
const Library = require('../models/Library');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// Get all library items with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = new RegExp(req.query.category, 'i');
    if (req.query.language) filter.language = req.query.language;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const total = await Library.countDocuments(filter);
    const items = await Library.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      data: items,
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

// Get single library item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Library.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('relatedItems', 'title type category rating');

    if (!item || !item.isPublished) {
      return res.status(404).json({ status: 'error', message: 'Library item not found' });
    }

    res.status(200).json({
      status: 'success',
      data: item
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create library item
router.post('/', async (req, res) => {
  try {
    const item = new Library(req.body);
    await item.save();
    res.status(201).json({
      status: 'success',
      message: 'Library item created successfully',
      data: item
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Update library item
router.put('/:id', async (req, res) => {
  try {
    const item = await Library.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Library item not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Library item updated successfully',
      data: item
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Delete library item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Library.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Library item not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Library item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Record download
router.post('/:id/download', async (req, res) => {
  try {
    const item = await Library.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Library item not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Download recorded',
      data: item
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get top downloaded items
router.get('/top/downloads', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const items = await Library.find({ isPublished: true })
      .sort({ downloads: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      data: items
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;