const router = require('express').Router();
const auth = require('../middleware/auth');
const { exportCosts, exportBilling, getDateRange } = require('../controllers/export.controller');

// All routes require authentication
router.get('/date-range', auth, getDateRange);
router.post('/costs', auth, exportCosts);
router.post('/billing', auth, exportBilling);

module.exports = router;
