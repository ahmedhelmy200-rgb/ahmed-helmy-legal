const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      index: true
    },
    code: {
      type: String,
      required: [true, 'Branch code is required'],
      unique: true,
      uppercase: true
    },
    description: String,
    type: {
      type: String,
      enum: ['headquarters', 'regional-office', 'branch-office', 'satellite-office'],
      default: 'branch-office'
    },
    location: {
      address: {
        street: String,
        city: {
          type: String,
          required: [true, 'City is required']
        },
        state: String,
        postalCode: String,
        country: {
          type: String,
          default: 'Egypt'
        }
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    contact: {
      phone: [String],
      email: [String],
      fax: String,
      website: String
    },
    manager: {
      name: String,
      email: String,
      phone: String,
      position: String
    },
    staffCount: {
      type: Number,
      default: 0
    },
    serviceAreas: [String],
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    facilities: [String],
    status: {
      type: String,
      enum: ['active', 'inactive', 'under-maintenance'],
      default: 'active'
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

branchSchema.index({ name: 'text', code: 1 });
branchSchema.index({ 'location.city': 1 });
branchSchema.index({ status: 1 });

module.exports = mongoose.model('Branch', branchSchema);