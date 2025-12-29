const mongoose = require('mongoose');

const legislationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Legislation title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    type: {
      type: String,
      enum: ['law', 'decree', 'regulation', 'amendment'],
      default: 'law'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'archived'],
      default: 'active'
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective date is required']
    },
    expiryDate: Date,
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    tags: [String],
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    relatedLegislations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Legislation'
      }
    ],
    author: String,
    source: String,
    views: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexing for better query performance
legislationSchema.index({ title: 'text', description: 'text', content: 'text' });
legislationSchema.index({ category: 1, status: 1 });
legislationSchema.index({ effectiveDate: -1 });

module.exports = mongoose.model('Legislation', legislationSchema);