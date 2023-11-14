const router = require('express').Router();
const authController = require('../controllers/authControllers');

router.post('/register', authController.createUser)
router.post('/login', authController.loginUser)
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-email', authController.resendEmail);
module.exports = router