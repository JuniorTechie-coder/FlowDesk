 // routes/auth.js
const express = require('express');
const router = express.Router();
const { authRegistration, loginUser, getCurrentUser, logoutUser } = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', authRegistration);
router.post('/login', loginUser);
router.post('/logout', logoutUser)

// Get current authenticated user
router.get('/me', protect ,getCurrentUser);

module.exports = router;