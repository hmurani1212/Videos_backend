/**
 * Payment Routes
 * Routes for payment management
 */

const express = require('express');
const router = express.Router();
const payment_controller = require('../controllers/payment.controller');
const auth_middleware = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/payments/check
 * @desc    Check if payment is required
 * @access  Private
 */
router.get('/check', auth_middleware.authenticate, payment_controller.check_payment_required);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment completion
 * @access  Private
 */
router.post('/verify', auth_middleware.authenticate, payment_controller.verify_payment);

/**
 * @route   GET /api/payments/status
 * @desc    Get payment status for current user
 * @access  Private
 */
router.get('/status', auth_middleware.authenticate, payment_controller.get_payment_status);

module.exports = router;
