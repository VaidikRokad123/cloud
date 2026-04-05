const router = require('express').Router();
const auth = require('../middleware/auth');
const { 
  getOverview, 
  getTrends, 
  getResources, 
  getOptimizations, 
  getSummary, 
  getServices, 
  getDaily, 
  getMonthly,
  addService,
  updateService,
  removeService
} = require('../controllers/cost.controller');

// All routes require authentication
router.get('/overview', auth, getOverview);
router.get('/trends', auth, getTrends);
router.get('/resources', auth, getResources);
router.get('/optimizations', auth, getOptimizations);

// Dashboard endpoints
router.get('/summary', auth, getSummary);
router.get('/services', auth, getServices);
router.get('/daily', auth, getDaily);
router.get('/monthly', auth, getMonthly);

// Service management endpoints
router.post('/services', auth, addService);
router.put('/services/:id', auth, updateService);
router.delete('/services/:id', auth, removeService);

module.exports = router;
