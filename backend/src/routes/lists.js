const router = require('express').Router();
const c = require('../controllers/listController');

router.post('/', c.createList);
router.put('/reorder', c.reorderLists);
router.put('/:id', c.updateList);
router.delete('/:id', c.deleteList);

module.exports = router;
