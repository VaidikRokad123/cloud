const router = require('express').Router();
const auth = require('../middleware/auth');
const { getOptimizations } = require('../controllers/cost.controller');

// GET /api/recommendations
router.get('/', auth, getOptimizations);

module.exports = router;
