const router = require('express').Router();
const { create, list, getById, update, remove, addComment, getComments, dashboard } = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/dashboard', dashboard);
router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', authorize('admin'), remove);
router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);

module.exports = router;
