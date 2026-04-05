const mongoose = require('mongoose');

const costRecordSchema = new mongoose.Schema({
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
  service: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  region: {
    type: String,
    default: 'us-east-1'
  },
  resourceType: {
    type: String,
    enum: ['compute', 'storage', 'network', 'database', 'other'],
    default: 'other'
  },
  usageHours: {
    type: Number,
    default: 0
  },
  usageAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CostRecord', costRecordSchema);
