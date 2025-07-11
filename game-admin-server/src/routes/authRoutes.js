const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, isSuperAdmin } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.post('/change-password', authenticate, authController.changePassword);

// SuperAdmin only routes
router.post('/create', authenticate, isSuperAdmin, authController.createAdmin);

module.exports = router; 