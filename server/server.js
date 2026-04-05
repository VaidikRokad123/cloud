const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const costRoutes = require('./routes/cost.routes');
const budgetRoutes = require('./routes/budget.routes');
const alertRoutes = require('./routes/alert.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const billingRoutes = require('./routes/billing.routes');
const cloudRoutes = require('./routes/cloud.routes');
const settingsRoutes = require('./routes/settings.routes');
const monitoringRoutes = require('./routes/monitoring.routes');
const exportRoutes = require('./routes/export.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/costs', costRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/cloud', cloudRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cloudcost')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
