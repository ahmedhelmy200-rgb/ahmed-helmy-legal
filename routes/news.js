const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// Get all news with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const total = await News.countDocuments(filter);
    const news = await News.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ isPinned: -1, publishedDate: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      data: news,
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

// Get single news by ID
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('relatedNews', 'title category publishedDate featuredImage');

    if (!newsItem || !newsItem.isPublished) {
      return res.status(404).json({ status: 'error', message: 'News not found' });
    }

    res.status(200).json({
      status: 'success',
      data: newsItem
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create news
router.post('/', async (req, res) => {
  try {
    const newsItem = new News(req.body);
    await newsItem.save();
    res.status(201).json({
      status: 'success',
      message: 'News created successfully',
      data: newsItem
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Update news
router.put('/:id', async (req, res) => {
  try {
    const newsItem = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!newsItem) {
      return res.status(404).json({ status: 'error', message: 'News not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'News updated successfully',
      data: newsItem
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Delete news
router.delete('/:id', async (req, res) => {
  try {
    const newsItem = await News.findByIdAndDelete(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ status: 'error', message: 'News not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'News deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get pinned news
router.get('/featured/pinned', async (req, res) => {
  try {
    const pinnedNews = await News.find({ isPublished: true, isPinned: true })
      .sort({ publishedDate: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      status: 'success',
      data: pinnedNews
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;