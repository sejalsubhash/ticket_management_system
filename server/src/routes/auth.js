const router = require('express').Router();
const { register, login, getMe, changePassword, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/password', authenticate, changePassword);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
