const router = require('express').Router();
const { getProfile, updateProfile, updatePassword } = require('../controllers/settings.controller');
const auth = require('../middleware/auth');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);

module.exports = router;
