const Alert = require('../models/Alert');
const CostRecord = require('../models/CostRecord');

/**
 * Create a new alert
 * POST /api/alerts/create
 */
exports.createAlert = async (req, res) => {
  try {
    const { name, type, provider, threshold } = req.body;

    // Calculate current spend for this provider
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const filter = { user: req.userId, date: { $gte: startOfMonth } };
    if (provider && provider !== 'All') filter.provider = provider;

    const costAgg = await CostRecord.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);
    const currentSpend = costAgg[0]?.total || 0;

    const alert = await Alert.create({
      user: req.userId,
      name,
      type: type || 'budget',
      provider: provider || 'All',
      threshold,
      currentSpend: Math.round(currentSpend * 100) / 100,
      isTriggered: currentSpend >= threshold,
      lastTriggered: currentSpend >= threshold ? new Date() : null
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ message: 'Error creating alert' });
  }
};

/**
 * Get all alerts for user
 * GET /api/alerts
 */
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.userId }).sort('-createdAt');

    // Update current spend for each alert
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const updatedAlerts = await Promise.all(alerts.map(async (alert) => {
      const filter = { user: req.userId, date: { $gte: startOfMonth } };
      if (alert.provider !== 'All') filter.provider = alert.provider;

      const costAgg = await CostRecord.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$cost' } } }
      ]);
      const currentSpend = costAgg[0]?.total || 0;

      alert.currentSpend = Math.round(currentSpend * 100) / 100;
      alert.isTriggered = currentSpend >= alert.threshold;
      if (alert.isTriggered && !alert.lastTriggered) {
        alert.lastTriggered = new Date();
      }
      await alert.save();
      return alert;
    }));

    res.json(updatedAlerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
};

/**
 * Delete an alert
 * DELETE /api/alerts/:id
 */
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting alert' });
  }
};
