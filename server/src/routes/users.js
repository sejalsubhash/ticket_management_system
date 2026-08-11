const router = require('express').Router();
const { listUsers, getUser, updateUserRole } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', listUsers);
router.get('/:id', getUser);
router.put('/:id/role', updateUserRole);

module.exports = router;
