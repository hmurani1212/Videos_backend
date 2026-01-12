/**
 * Authentication Routes
 * Routes for user authentication
 */

const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/auth.controller');
const auth_middleware = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', auth_controller.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', auth_controller.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', auth_middleware.authenticate, auth_controller.get_current_user);

module.exports = router;

