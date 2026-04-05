const CloudAccount = require('../models/CloudAccount');

/**
 * Add a cloud account
 * POST /api/cloud/add
 */
exports.addAccount = async (req, res) => {
  try {
    const { provider, accountName, accountId, apiKey, region } = req.body;

    const account = await CloudAccount.create({
      user: req.userId,
      provider,
      accountName,
      accountId,
      apiKey: apiKey || `mock-${provider.toLowerCase()}-key-${Date.now()}`,
      region: region || 'us-east-1'
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('Add cloud account error:', error);
    res.status(500).json({ message: 'Error adding cloud account' });
  }
};

/**
 * List all cloud accounts for the user
 * GET /api/cloud/list
 */
exports.listAccounts = async (req, res) => {
  try {
    const accounts = await CloudAccount.find({ user: req.userId }).sort('-createdAt');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cloud accounts' });
  }
};

/**
 * Delete a cloud account
 * DELETE /api/cloud/:id
 */
exports.deleteAccount = async (req, res) => {
  try {
    const account = await CloudAccount.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account' });
  }
};
