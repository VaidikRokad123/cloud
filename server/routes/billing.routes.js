const router = require('express').Router();
const { getHistory, exportCSV } = require('../controllers/billing.controller');
const auth = require('../middleware/auth');

router.get('/history', auth, getHistory);
router.get('/export', auth, exportCSV);

module.exports = router;
