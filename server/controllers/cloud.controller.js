const CloudAccount = require('../models/CloudAccount');
const CostRecord = require('../models/CostRecord');
const { fetchGCPCosts, getGCPUsageMetrics } = require('../services/gcpService');
const { fetchAzureCosts, getAzureUsageMetrics } = require('../services/azureService');

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

/**
 * Get multi-cloud cost comparison
 * GET /api/cloud/comparison
 */
exports.getComparison = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    // Get costs grouped by provider
    const costsByProvider = await CostRecord.aggregate([
      {
        $match: {
          user: req.userId,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$provider',
          totalCost: { $sum: '$cost' },
          services: { $addToSet: '$service' },
          avgCost: { $avg: '$cost' }
        }
      }
    ]);

    // Get service breakdown by provider
    const serviceBreakdown = await CostRecord.aggregate([
      {
        $match: {
          user: req.userId,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { provider: '$provider', service: '$service' },
          cost: { $sum: '$cost' }
        }
      },
      {
        $group: {
          _id: '$_id.provider',
          services: {
            $push: {
              name: '$_id.service',
              cost: '$cost'
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      period: { startDate: start, endDate: end },
      providers: costsByProvider,
      serviceBreakdown
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ message: 'Error fetching comparison data' });
  }
};

/**
 * Sync costs from all cloud providers
 * POST /api/cloud/sync
 */
exports.syncCosts = async (req, res) => {
  try {
    const accounts = await CloudAccount.find({ user: req.userId, isActive: true });
    const results = [];

    for (const account of accounts) {
      try {
        let costs;
        const startDate = new Date(new Date().setDate(1));
        const endDate = new Date();

        if (account.provider === 'GCP') {
          costs = await fetchGCPCosts(account.accountId, account.apiKey, startDate, endDate);
        } else if (account.provider === 'Azure') {
          costs = await fetchAzureCosts(account.accountId, null, null, account.apiKey, startDate, endDate);
        } else {
          // AWS - use existing cloudwatch service
          costs = { costs: [] }; // Placeholder
        }

        // Save costs to database
        if (costs.costs) {
          for (const service of costs.costs) {
            await CostRecord.create({
              user: req.userId,
              provider: account.provider,
              service: service.service,
              cost: service.cost,
              date: new Date(),
              region: account.region,
              resourceType: service.type || 'other'
            });
          }
        }

        results.push({
          provider: account.provider,
          accountName: account.accountName,
          success: true,
          servicesCount: costs.costs?.length || 0
        });
      } catch (error) {
        results.push({
          provider: account.provider,
          accountName: account.accountName,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Sync completed',
      results
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ message: 'Error syncing costs' });
  }
};
