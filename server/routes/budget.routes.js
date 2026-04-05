const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/budget
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      monthlyBudget: user.monthlyBudget,
      currency: user.currency,
      alertThreshold: 80 // Default threshold
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget' });
  }
});

// PUT /api/budget
router.put('/', auth, async (req, res) => {
  try {
    const { monthlyBudget, currency } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (monthlyBudget !== undefined) user.monthlyBudget = Number(monthlyBudget);
    if (currency !== undefined) user.currency = currency;
    
    await user.save();
    
    res.json({ 
      message: 'Budget updated successfully',
      monthlyBudget: user.monthlyBudget,
      currency: user.currency
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating budget' });
  }
});

module.exports = router;
