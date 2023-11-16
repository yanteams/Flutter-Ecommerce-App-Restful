const router = require('express').Router();
const authController = require('../controllers/authControllers');
const { verifyToken, isAdmin } = require('../middleware/verifyToken')

router.post('/register', authController.createUser)
router.post('/login', authController.loginUser)
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-email', authController.resendEmail);
router.get('/get-users', authController.getallUsers);
router.get('/get-user/:id', verifyToken, isAdmin, authController.getUser);
router.delete('/delete-user/:id', authController.deleteUser);
router.put('/update-user/:id', verifyToken, authController.updateUser);
router.put('/banned-user/:id', verifyToken, isAdmin, authController.blockUser);
router.put('/unlock-user/:id', verifyToken, isAdmin, authController.unlockUser);
router.get('/refresh', authController.handleRefreshToken);
router.get('/logout', authController.logout);

module.exports = router