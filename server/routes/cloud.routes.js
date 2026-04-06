const router = require('express').Router();
const { addAccount, listAccounts, deleteAccount, getComparison, syncCosts } = require('../controllers/cloud.controller');
const auth = require('../middleware/auth');

router.post('/add', auth, addAccount);
router.get('/list', auth, listAccounts);
router.delete('/:id', auth, deleteAccount);
router.get('/comparison', auth, getComparison);
router.post('/sync', auth, syncCosts);

module.exports = router;
