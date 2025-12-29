const mongoose = require('mongoose');

const knowledgeBankSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Knowledge title is required'],
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
    category: {
      type: String,
      enum: ['legal-guides', 'faq', 'case-studies', 'best-practices', 'tutorials'],
      required: [true, 'Category is required']
    },
    subcategory: String,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    author: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    tags: [String],
    keywords: [String],
    relatedArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeBank'
      }
    ],
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
    views: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

knowledgeBankSchema.index({ title: 'text', description: 'text', content: 'text' });
knowledgeBankSchema.index({ category: 1, status: 1 });
knowledgeBankSchema.index({ author: 1 });
knowledgeBankSchema.index({ rating: -1 });

module.exports = mongoose.model('KnowledgeBank', knowledgeBankSchema);