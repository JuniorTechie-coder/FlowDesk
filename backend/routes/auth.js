 // routes/auth.js
const express = require('express');
const router = express.Router();
const { authRegistration, loginUser } = require('../controllers/authController');

router.post('/register', authRegistration);
router.post('/login', loginUser);

module.exports = router;