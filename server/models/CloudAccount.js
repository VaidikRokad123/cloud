const mongoose = require('mongoose');

const cloudAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['AWS', 'Azure', 'GCP']
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  accountId: {
    type: String,
    required: true,
    trim: true
  },
  apiKey: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: 'us-east-1'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CloudAccount', cloudAccountSchema);
