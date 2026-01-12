/**
 * Payment Service
 * Handles payment-related business logic
 */

const payment_data_repository = require('../data_repositories/payment.data_repository');
const video_view_data_repository = require('../data_repositories/video_view.data_repository');

// Payment amount (in your currency)
const PAYMENT_AMOUNT = 300; // Adjust as needed
const QR_CODE_URL = "https://i0.wp.com/rakistandukan.pk/wp-content/uploads/2022/08/IMG_0145-1.png?resize=300%2C293";

class payment_service {
    constructor() {
        console.log('FILE: payment.service.js | constructor | Service initialized');
    }

    /**
     * Check if user needs to pay (viewed 3 videos, trying to watch another)
     */
    async check_payment_required(user_id) {
        try {
            console.log(`FILE: payment.service.js | check_payment_required | Checking payment requirement for user: ${user_id}`);

            // Check if user has completed payment
            const has_paid = await payment_data_repository.has_completed_payment(user_id);
            if (has_paid) {
                return {
                    STATUS: "SUCCESSFUL",
                    ERROR_CODE: "",
                    ERROR_FILTER: "",
                    ERROR_DESCRIPTION: "",
                    DB_DATA: {
                        payment_required: false,
                        reason: "User has already paid"
                    }
                };
            }

            // Count how many videos user has viewed
            const viewed_videos_count = await video_view_data_repository.get_user_viewed_count(user_id);

            // Allow 3 free videos, payment required after 3 videos
            const FREE_VIDEOS_LIMIT = 3;
            
            // If user has viewed 3 or more videos, payment is required for next video
            if (viewed_videos_count >= FREE_VIDEOS_LIMIT) {
                // Check if user has a pending payment
                const pending_payment = await payment_data_repository.get_active_payment_by_user(user_id);
                
                if (pending_payment) {
                    return {
                        STATUS: "SUCCESSFUL",
                        ERROR_CODE: "",
                        ERROR_FILTER: "",
                        ERROR_DESCRIPTION: "",
                        DB_DATA: {
                            payment_required: true,
                            payment_id: pending_payment._id,
                            qr_code_url: pending_payment.qr_code_url || QR_CODE_URL,
                            amount: pending_payment.amount,
                            reason: "Payment pending"
                        }
                    };
                }

                // Create new payment request
                const new_payment = await payment_data_repository.create_payment({
                    user_id: user_id,
                    amount: PAYMENT_AMOUNT,
                    payment_status: 'pending',
                    payment_method: 'qr_code',
                    qr_code_url: QR_CODE_URL
                });

                return {
                    STATUS: "SUCCESSFUL",
                    ERROR_CODE: "",
                    ERROR_FILTER: "",
                    ERROR_DESCRIPTION: "",
                    DB_DATA: {
                        payment_required: true,
                        payment_id: new_payment._id,
                        qr_code_url: QR_CODE_URL,
                        amount: PAYMENT_AMOUNT,
                        reason: `You have watched ${viewed_videos_count} free videos. Payment required to continue.`
                    }
                };
            }

            // User hasn't reached the free video limit yet, no payment required
            const remaining_free = FREE_VIDEOS_LIMIT - viewed_videos_count;
            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: {
                    payment_required: false,
                    reason: `You have ${remaining_free} free video${remaining_free > 1 ? 's' : ''} remaining`,
                    viewed_count: viewed_videos_count,
                    free_limit: FREE_VIDEOS_LIMIT
                }
            };
        } catch (error) {
            console.error(`FILE: payment.service.js | check_payment_required | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-10001",
                ERROR_DESCRIPTION: error.message || "Failed to check payment requirement"
            };
        }
    }

    /**
     * Verify payment completion
     */
    async verify_payment(payment_id, transaction_id) {
        try {
            console.log(`FILE: payment.service.js | verify_payment | Verifying payment: ${payment_id}`);

            // Update payment status to completed
            const updated_payment = await payment_data_repository.update_payment_status(
                payment_id,
                'completed',
                transaction_id
            );

            if (!updated_payment) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "NOT_FOUND",
                    ERROR_CODE: "VTAPP-10002",
                    ERROR_DESCRIPTION: "Payment not found"
                };
            }

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: {
                    payment: updated_payment,
                    access_granted: true
                }
            };
        } catch (error) {
            console.error(`FILE: payment.service.js | verify_payment | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-10003",
                ERROR_DESCRIPTION: error.message || "Failed to verify payment"
            };
        }
    }

    /**
     * Get payment status
     */
    async get_payment_status(user_id) {
        try {
            console.log(`FILE: payment.service.js | get_payment_status | Getting payment status for user: ${user_id}`);

            const has_paid = await payment_data_repository.has_completed_payment(user_id);
            const pending_payment = await payment_data_repository.get_active_payment_by_user(user_id);

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: {
                    has_paid: has_paid,
                    pending_payment: pending_payment,
                    payment_required: !has_paid && pending_payment !== null
                }
            };
        } catch (error) {
            console.error(`FILE: payment.service.js | get_payment_status | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-10004",
                ERROR_DESCRIPTION: error.message || "Failed to get payment status"
            };
        }
    }
}

module.exports = new payment_service();
