/**
 * Payment Controller
 * Handles payment-related requests
 */

const payment_service = require('../services/payment.service');

class payment_controller {
    /**
     * Check if payment is required
     */
    async check_payment_required(req, res) {
        try {
            console.log(`FILE: payment.controller.js | check_payment_required | Checking payment requirement`);

            const result = await payment_service.check_payment_required(req.user.user_id);

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: payment.controller.js | check_payment_required | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-11001",
                ERROR_DESCRIPTION: "Failed to check payment requirement"
            });
        }
    }

    /**
     * Verify payment completion
     */
    async verify_payment(req, res) {
        try {
            console.log(`FILE: payment.controller.js | verify_payment | Verifying payment`);

            const { payment_id, transaction_id } = req.body;

            if (!payment_id) {
                return res.status(400).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "INVALID_REQUEST",
                    ERROR_CODE: "VTAPP-11002",
                    ERROR_DESCRIPTION: "Payment ID is required"
                });
            }

            const result = await payment_service.verify_payment(payment_id, transaction_id);

            if (result.STATUS === "ERROR") {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: payment.controller.js | verify_payment | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-11003",
                ERROR_DESCRIPTION: "Failed to verify payment"
            });
        }
    }

    /**
     * Get payment status
     */
    async get_payment_status(req, res) {
        try {
            console.log(`FILE: payment.controller.js | get_payment_status | Getting payment status`);

            const result = await payment_service.get_payment_status(req.user.user_id);

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: payment.controller.js | get_payment_status | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-11004",
                ERROR_DESCRIPTION: "Failed to get payment status"
            });
        }
    }
}

module.exports = new payment_controller();
