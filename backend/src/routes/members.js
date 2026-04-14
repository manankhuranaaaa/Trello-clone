const router = require('express').Router();
const c = require('../controllers/memberController');

router.get('/', c.getMembers);

module.exports = router;
