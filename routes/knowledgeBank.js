const express = require('express');
const router = express.Router();
const KnowledgeBank = require('../models/KnowledgeBank');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// Get all knowledge bank articles with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.author) filter.author = new RegExp(req.query.author, 'i');
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const total = await KnowledgeBank.countDocuments(filter);
    const articles = await KnowledgeBank.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      data: articles,
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

// Get single article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await KnowledgeBank.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('relatedArticles', 'title category difficulty');

    if (!article || !article.isPublished) {
      return res.status(404).json({ status: 'error', message: 'Article not found' });
    }

    res.status(200).json({
      status: 'success',
      data: article
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create article
router.post('/', async (req, res) => {
  try {
    const article = new KnowledgeBank(req.body);
    await article.save();
    res.status(201).json({
      status: 'success',
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Update article
router.put('/:id', async (req, res) => {
  try {
    const article = await KnowledgeBank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ status: 'error', message: 'Article not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Article updated successfully',
      data: article
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Delete article
router.delete('/:id', async (req, res) => {
  try {
    const article = await KnowledgeBank.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ status: 'error', message: 'Article not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get top rated articles
router.get('/top/rated', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const articles = await KnowledgeBank.find({ isPublished: true })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      data: articles
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;