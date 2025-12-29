const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Library item title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    type: {
      type: String,
      enum: ['book', 'journal', 'case-law', 'contract-template', 'form', 'document', 'research-paper'],
      required: [true, 'Type is required']
    },
    author: String,
    publisher: String,
    publicationDate: Date,
    category: {
      type: String,
      required: [true, 'Category is required']
    },
    subcategory: String,
    isbn: String,
    issn: String,
    language: {
      type: String,
      default: 'en'
    },
    pages: Number,
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    fileSize: Number,
    fileType: String,
    coverImage: {
      url: String,
      alt: String
    },
    tags: [String],
    keywords: [String],
    status: {
      type: String,
      enum: ['available', 'pending', 'archived'],
      default: 'available'
    },
    views: {
      type: Number,
      default: 0
    },
    downloads: {
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
    relatedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Library'
      }
    ],
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

librarySchema.index({ title: 'text', description: 'text' });
librarySchema.index({ type: 1, category: 1 });
librarySchema.index({ rating: -1 });
librarySchema.index({ downloads: -1 });

module.exports = mongoose.model('Library', librarySchema);