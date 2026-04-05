const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['budget', 'anomaly', 'threshold'],
    default: 'budget'
  },
  provider: {
    type: String,
    enum: ['AWS', 'Azure', 'GCP', 'All'],
    default: 'All'
  },
  threshold: {
    type: Number,
    required: true
  },
  currentSpend: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTriggered: {
    type: Boolean,
    default: false
  },
  lastTriggered: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
