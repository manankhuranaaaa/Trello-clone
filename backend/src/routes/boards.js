const router = require('express').Router();
const c = require('../controllers/boardController');

router.get('/', c.getBoards);
router.post('/', c.createBoard);
router.get('/:id', c.getBoard);
router.put('/:id', c.updateBoard);
router.delete('/:id', c.deleteBoard);

module.exports = router;
