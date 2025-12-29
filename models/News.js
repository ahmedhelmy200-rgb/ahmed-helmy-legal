const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
      index: true
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      maxlength: 500
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    author: {
      type: String,
      required: [true, 'Author is required']
    },
    category: {
      type: String,
      enum: ['legal-updates', 'court-decisions', 'announcements', 'events', 'opinion'],
      required: [true, 'Category is required']
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    featuredImage: {
      url: String,
      alt: String
    },
    attachments: [
      {
        filename: String,
        url: String,
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    tags: [String],
    keywords: [String],
    publishedDate: {
      type: Date,
      required: true
    },
    expiryDate: Date,
    views: {
      type: Number,
      default: 0
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    relatedNews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'News'
      }
    ],
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

newsSchema.index({ title: 'text', summary: 'text', content: 'text' });
newsSchema.index({ category: 1, status: 1 });
newsSchema.index({ publishedDate: -1 });
newsSchema.index({ isPinned: -1, publishedDate: -1 });

module.exports = mongoose.model('News', newsSchema);