const router = require('express').Router();
const { create, list, getById, update, remove, addComment, getComments, dashboard, bulkCreate } = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/dashboard', dashboard);
router.get('/', list);
router.post('/', upload.array('files', 5), create);
router.post('/bulk', bulkCreate);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', authorize('admin'), remove);
router.post('/:id/comments', upload.array('files', 3), addComment);
router.get('/:id/comments', getComments);

module.exports = router;
