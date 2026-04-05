const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * JWT authentication middleware
 * Verifies the Bearer token from the Authorization header
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Store as ObjectId so it works in both .find() and aggregation $match
    req.userId = new mongoose.Types.ObjectId(decoded.userId);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
