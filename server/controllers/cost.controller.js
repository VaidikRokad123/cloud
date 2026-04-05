const CostRecord = require('../models/CostRecord');
const User = require('../models/User');
const { generateCostRecords } = require('../utils/mockDataGenerator');

/**
 * Get cost summary for dashboard
 * GET /api/costs/summary
 */
exports.getSummary = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const currentMonthCosts = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);

    const totalCost = currentMonthCosts[0]?.total || 0;
    const budget = user?.monthlyBudget || 10000;
    const percentUsed = budget > 0 ? ((totalCost / budget) * 100).toFixed(1) : 0;

    res.json({
      totalCost: Math.round(totalCost * 100) / 100,
      budget,
      percentUsed: parseFloat(percentUsed)
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Error fetching summary' });
  }
};

/**
 * Get services breakdown
 * GET /api/costs/services
 */
exports.getServices = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all cost records for current month
    const costRecords = await CostRecord.find({
      user: req.userId,
      date: { $gte: startOfMonth }
    });

    // Map to capitalize type for frontend
    const capitalizeType = (type) => {
      const typeMap = {
        'compute': 'Compute',
        'storage': 'Storage',
        'database': 'Database',
        'network': 'Network',
        'other': 'Other'
      };
      return typeMap[type] || 'Other';
    };

    // Group by service name
    const serviceMap = {};
    let totalCost = 0;

    costRecords.forEach(record => {
      const key = `${record.service}-${record.resourceType}`;
      if (!serviceMap[key]) {
        serviceMap[key] = {
          id: record._id.toString(),
          name: record.service,
          type: capitalizeType(record.resourceType),
          cost: 0,
          usage: `${record.usageAmount || 0} ${record.usageUnit || 'units'}`,
          limit: 'No limit',
          status: 'active',
          percentOfTotal: 0
        };
      }
      serviceMap[key].cost += record.cost;
      totalCost += record.cost;
    });

    // Calculate percentages
    const result = Object.values(serviceMap).map(service => ({
      ...service,
      cost: Math.round(service.cost * 100) / 100,
      percentOfTotal: totalCost > 0 ? Math.round((service.cost / totalCost) * 100) : 0
    }));

    // Sort by cost descending
    result.sort((a, b) => b.cost - a.cost);

    res.json(result);
  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
};

/**
 * Get daily costs
 * GET /api/costs/daily
 */
exports.getDaily = async (req, res) => {
  try {
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const dailyCosts = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          cost: { $sum: '$cost' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const result = dailyCosts.map(d => ({
      date: d._id,
      cost: Math.round(d.cost * 100) / 100
    }));

    res.json(result);
  } catch (error) {
    console.error('Daily costs error:', error);
    res.status(500).json({ message: 'Error fetching daily costs' });
  }
};

/**
 * Get monthly costs
 * GET /api/costs/monthly
 */
exports.getMonthly = async (req, res) => {
  try {
    const months = 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlyCosts = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          cost: { $sum: '$cost' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const result = monthlyCosts.map(m => ({
      month: m._id,
      cost: Math.round(m.cost * 100) / 100
    }));

    res.json(result);
  } catch (error) {
    console.error('Monthly costs error:', error);
    res.status(500).json({ message: 'Error fetching monthly costs' });
  }
};

/**
 * Get optimization suggestions (recommendations)
 * GET /api/costs/optimizations
 */
exports.getOptimizations = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const costs = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { service: '$service', provider: '$provider', type: '$resourceType' },
          totalCost: { $sum: '$cost' },
          avgCost: { $avg: '$cost' },
          avgHours: { $avg: '$usageHours' }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    const suggestions = [];
    const id = () => Math.random().toString(36).substring(2, 10);

    costs.forEach(c => {
      // Idle resource detection
      if (c.avgHours < 6) {
        suggestions.push({
          id: id(),
          type: 'idle',
          severity: 'high',
          issue: `Idle ${c._id.service} detected`,
          recommendation: `Your ${c._id.service} on ${c._id.provider} averages only ${Math.round(c.avgHours)}h/day usage. Consider stopping or downsizing to reduce costs.`,
          provider: c._id.provider,
          service: c._id.service,
          estimatedSavings: Math.round(c.totalCost * 0.6 * 100) / 100
        });
      }

      // Right-sizing
      if (c._id.type === 'compute' && c.avgCost > 50) {
        suggestions.push({
          id: id(),
          type: 'rightsize',
          severity: 'medium',
          issue: `Oversized ${c._id.service} instances`,
          recommendation: `Your ${c._id.service} spend on ${c._id.provider} is $${Math.round(c.totalCost)}. Consider moving to a smaller instance type to optimize costs.`,
          provider: c._id.provider,
          service: c._id.service,
          estimatedSavings: Math.round(c.totalCost * 0.3 * 100) / 100
        });
      }

      // Reserved instances
      if (c.avgHours > 18 && c.totalCost > 200) {
        suggestions.push({
          id: id(),
          type: 'reserved',
          severity: 'medium',
          issue: `High utilization on ${c._id.service}`,
          recommendation: `${c._id.service} on ${c._id.provider} runs ${Math.round(c.avgHours)}h/day. Switch to reserved instances to save up to 40%.`,
          provider: c._id.provider,
          service: c._id.service,
          estimatedSavings: Math.round(c.totalCost * 0.4 * 100) / 100
        });
      }
    });

    // Sort by savings potential
    suggestions.sort((a, b) => b.estimatedSavings - a.estimatedSavings);

    res.json(suggestions.slice(0, 15));
  } catch (error) {
    console.error('Optimizations error:', error);
    res.status(500).json({ message: 'Error generating optimizations' });
  }
};


/**
 * Get cost overview (totals by provider and service)
 * GET /api/costs/overview
 */
exports.getOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month costs
    const currentMonthCosts = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);

    // Last month costs (for comparison)
    const lastMonthCosts = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: lastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);

    // Cost by provider
    const byProvider = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$provider', total: { $sum: '$cost' } } },
      { $sort: { total: -1 } }
    ]);

    // Cost by service (top 10)
    const byService = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: { service: '$service', provider: '$provider' }, total: { $sum: '$cost' } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Cost by resource type
    const byResourceType = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$resourceType', total: { $sum: '$cost' } } },
      { $sort: { total: -1 } }
    ]);

    const currentTotal = currentMonthCosts[0]?.total || 0;
    const lastTotal = lastMonthCosts[0]?.total || 0;
    const changePercent = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal * 100).toFixed(1) : 0;

    res.json({
      totalCost: Math.round(currentTotal * 100) / 100,
      lastMonthCost: Math.round(lastTotal * 100) / 100,
      changePercent: parseFloat(changePercent),
      byProvider: byProvider.map(p => ({ provider: p._id, total: Math.round(p.total * 100) / 100 })),
      byService: byService.map(s => ({
        service: s._id.service,
        provider: s._id.provider,
        total: Math.round(s.total * 100) / 100
      })),
      byResourceType: byResourceType.map(r => ({
        type: r._id,
        total: Math.round(r.total * 100) / 100
      }))
    });
  } catch (error) {
    console.error('Cost overview error:', error);
    res.status(500).json({ message: 'Error fetching cost overview' });
  }
};

/**
 * Get cost trends (daily costs for the past N days)
 * GET /api/costs/trends?days=30
 */
exports.getTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Daily totals
    const dailyTrends = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            provider: '$provider'
          },
          total: { $sum: '$cost' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Reshape into { date, AWS, Azure, GCP, total }
    const dateMap = {};
    dailyTrends.forEach(item => {
      const date = item._id.date;
      if (!dateMap[date]) {
        dateMap[date] = { date, AWS: 0, Azure: 0, GCP: 0, total: 0 };
      }
      dateMap[date][item._id.provider] = Math.round(item.total * 100) / 100;
      dateMap[date].total += item.total;
    });

    const trends = Object.values(dateMap)
      .map(d => ({ ...d, total: Math.round(d.total * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ trends, predictions: [] });
  } catch (error) {
    console.error('Cost trends error:', error);
    res.status(500).json({ message: 'Error fetching cost trends' });
  }
};

/**
 * Get resource usage breakdown
 * GET /api/costs/resources
 */
exports.getResources = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const resources = await CostRecord.aggregate([
      { $match: { user: req.userId, date: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { type: '$resourceType', provider: '$provider' },
          totalCost: { $sum: '$cost' },
          totalHours: { $sum: '$usageHours' },
          totalUsage: { $sum: '$usageAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    const resourceData = resources.map(r => ({
      type: r._id.type,
      provider: r._id.provider,
      totalCost: Math.round(r.totalCost * 100) / 100,
      totalHours: r.totalHours,
      utilization: Math.round(Math.random() * 40 + 40),
      count: r.count
    }));

    res.json(resourceData);
  } catch (error) {
    console.error('Resources error:', error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

/**
 * Add a new service (creates cost records)
 * POST /api/costs/services
 */
exports.addService = async (req, res) => {
  try {
    const { name, type, cost, usage, limit } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    // Map frontend type to backend enum (lowercase)
    const resourceTypeMap = {
      'Compute': 'compute',
      'Storage': 'storage',
      'Database': 'database',
      'Network': 'network'
    };

    const resourceType = resourceTypeMap[type] || 'other';

    // Create a cost record for this service for the current month
    const now = new Date();
    const costRecord = new CostRecord({
      user: req.userId,
      date: now,
      provider: 'AWS', // Default to AWS for custom services
      service: name,
      resourceType: resourceType,
      cost: parseFloat(cost) || 0,
      usageHours: 24,
      usageAmount: parseFloat(usage) || 0,
      usageUnit: 'units'
    });

    await costRecord.save();

    res.status(201).json({
      message: 'Service added successfully',
      service: {
        id: costRecord._id,
        name,
        type,
        cost: parseFloat(cost) || 0,
        usage,
        limit,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({ message: 'Error adding service' });
  }
};

/**
 * Update a service
 * PUT /api/costs/services/:id
 */
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, cost, usage, limit, status } = req.body;

    const costRecord = await CostRecord.findOne({ _id: id, user: req.userId });

    if (!costRecord) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Map frontend type to backend enum (lowercase)
    const resourceTypeMap = {
      'Compute': 'compute',
      'Storage': 'storage',
      'Database': 'database',
      'Network': 'network'
    };

    // Update the cost record
    if (name) costRecord.service = name;
    if (type) costRecord.resourceType = resourceTypeMap[type] || 'other';
    if (cost !== undefined) costRecord.cost = parseFloat(cost);
    if (usage !== undefined) costRecord.usageAmount = parseFloat(usage);

    await costRecord.save();

    res.json({
      message: 'Service updated successfully',
      service: {
        id: costRecord._id,
        name: costRecord.service,
        type: costRecord.resourceType,
        cost: costRecord.cost,
        status: status || 'active'
      }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Error updating service' });
  }
};

/**
 * Remove a service
 * DELETE /api/costs/services/:id
 */
exports.removeService = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await CostRecord.deleteOne({ _id: id, user: req.userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service removed successfully' });
  } catch (error) {
    console.error('Remove service error:', error);
    res.status(500).json({ message: 'Error removing service' });
  }
};
