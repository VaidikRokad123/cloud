const { getEC2CPUUtilization, getRDSConnections, getResourceUtilization, trackAppMetrics } = require('../services/cloudwatchService');
const CloudAccount = require('../models/CloudAccount');

/**
 * Get EC2 instance metrics
 * GET /api/monitoring/ec2/:instanceId
 */
exports.getEC2Metrics = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { hours = 24 } = req.query;

    const metrics = await getEC2CPUUtilization(instanceId, parseInt(hours));

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('EC2 metrics error:', error);
    res.status(500).json({ message: 'Failed to fetch EC2 metrics' });
  }
};

/**
 * Get RDS database metrics
 * GET /api/monitoring/rds/:dbInstanceId
 */
exports.getRDSMetrics = async (req, res) => {
  try {
    const { dbInstanceId } = req.params;
    const { hours = 24 } = req.query;

    const metrics = await getRDSConnections(dbInstanceId, parseInt(hours));

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('RDS metrics error:', error);
    res.status(500).json({ message: 'Failed to fetch RDS metrics' });
  }
};

/**
 * Get resource utilization summary
 * POST /api/monitoring/utilization
 */
exports.getUtilization = async (req, res) => {
  try {
    const { resources } = req.body;
    
    // Example: { ec2Instances: ['i-123', 'i-456'], rdsInstances: ['db-1'] }
    const utilization = await getResourceUtilization(resources);

    res.json({
      success: true,
      utilization
    });
  } catch (error) {
    console.error('Utilization error:', error);
    res.status(500).json({ message: 'Failed to fetch resource utilization' });
  }
};

/**
 * Track user action (for analytics)
 * POST /api/monitoring/track
 */
exports.trackAction = async (req, res) => {
  try {
    const { action, value = 1 } = req.body;
    
    await trackAppMetrics(req.userId.toString(), action, value);

    res.json({
      success: true,
      message: 'Action tracked'
    });
  } catch (error) {
    console.error('Track action error:', error);
    res.status(500).json({ message: 'Failed to track action' });
  }
};
