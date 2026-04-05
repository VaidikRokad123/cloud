const router = require('express').Router();
const auth = require('../middleware/auth');
const { getEC2Metrics, getRDSMetrics, getUtilization, trackAction } = require('../controllers/monitoring.controller');

// All routes require authentication
router.get('/ec2/:instanceId', auth, getEC2Metrics);
router.get('/rds/:dbInstanceId', auth, getRDSMetrics);
router.post('/utilization', auth, getUtilization);
router.post('/track', auth, trackAction);

module.exports = router;
