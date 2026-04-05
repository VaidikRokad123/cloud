const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAlerts } = require('../controllers/alert.controller');

// GET /api/alerts
router.get('/', auth, getAlerts);

module.exports = router;
