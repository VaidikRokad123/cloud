const User = require('../models/User');

/**
 * Get user profile
 * GET /api/settings/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      currency: user.currency,
      company: user.company,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

/**
 * Update user profile
 * PUT /api/settings/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, monthlyBudget, currency, company } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
    if (currency) user.currency = currency;
    if (company !== undefined) user.company = company;

    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      currency: user.currency,
      company: user.company
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

/**
 * Update password
 * PUT /api/settings/password
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password' });
  }
};
