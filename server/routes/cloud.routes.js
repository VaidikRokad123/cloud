const router = require('express').Router();
const { addAccount, listAccounts, deleteAccount } = require('../controllers/cloud.controller');
const auth = require('../middleware/auth');

router.post('/add', auth, addAccount);
router.get('/list', auth, listAccounts);
router.delete('/:id', auth, deleteAccount);

module.exports = router;
