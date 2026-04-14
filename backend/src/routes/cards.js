const router = require('express').Router();
const c = require('../controllers/cardController');

router.get('/search', c.searchCards);
router.post('/', c.createCard);
router.get('/:id', c.getCard);
router.put('/:id', c.updateCard);
router.delete('/:id', c.deleteCard);
router.post('/:id/move', c.moveCard);
router.post('/reorder', c.reorderCards);

router.post('/:id/labels', c.addLabel);
router.delete('/:id/labels/:label_id', c.removeLabel);

router.post('/:id/members', c.addMember);
router.delete('/:id/members/:member_id', c.removeMember);

router.post('/:id/checklists', c.createChecklist);
router.delete('/:id/checklists/:checklist_id', c.deleteChecklist);
router.post('/:id/checklists/:checklist_id/items', c.addChecklistItem);
router.put('/:id/checklists/:checklist_id/items/:item_id', c.updateChecklistItem);
router.delete('/:id/checklists/:checklist_id/items/:item_id', c.deleteChecklistItem);

router.post('/:id/comments', c.addComment);
router.delete('/:id/comments/:comment_id', c.deleteComment);

module.exports = router;
