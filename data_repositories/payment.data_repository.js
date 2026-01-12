/**
 * Payment Data Repository
 * Handles all database operations for payments table
 */

const payment_model = require('../models/payment.model');

class payment_data_repository {
    constructor() {
        console.log('FILE: payment.data_repository.js | constructor | Data Repository initialized');
    }

    /**
     * Create a new payment
     */
    async create_payment(payment_data) {
        try {
            console.log(`FILE: payment.data_repository.js | create_payment | Creating payment for user: ${payment_data.user_id}`);
            const new_payment = new payment_model(payment_data);
            return await new_payment.save();
        } catch (error) {
            console.error(`FILE: payment.data_repository.js | create_payment | Error:`, error);
            throw error;
        }
    }

    /**
     * Get payment by ID
     */
    async get_payment_by_id(payment_id) {
        try {
            console.log(`FILE: payment.data_repository.js | get_payment_by_id | Fetching payment: ${payment_id}`);
            return await payment_model.findOne({ _id: payment_id });
        } catch (error) {
            console.error(`FILE: payment.data_repository.js | get_payment_by_id | Error:`, error);
            throw error;
        }
    }

    /**
     * Get active payment for user
     */
    async get_active_payment_by_user(user_id) {
        try {
            console.log(`FILE: payment.data_repository.js | get_active_payment_by_user | Fetching active payment for user: ${user_id}`);
            return await payment_model.findOne({
                user_id: user_id,
                payment_status: 'pending'
            }).sort({ created_at: -1 });
        } catch (error) {
            console.error(`FILE: payment.data_repository.js | get_active_payment_by_user | Error:`, error);
            throw error;
        }
    }

    /**
     * Check if user has completed payment
     */
    async has_completed_payment(user_id) {
        try {
            console.log(`FILE: payment.data_repository.js | has_completed_payment | Checking payment status for user: ${user_id}`);
            const payment = await payment_model.findOne({
                user_id: user_id,
                payment_status: 'completed'
            });
            return payment !== null;
        } catch (error) {
            console.error(`FILE: payment.data_repository.js | has_completed_payment | Error:`, error);
            throw error;
        }
    }

    /**
     * Update payment status
     */
    async update_payment_status(payment_id, status, transaction_id = null) {
        try {
            console.log(`FILE: payment.data_repository.js | update_payment_status | Updating payment: ${payment_id} to status: ${status}`);
            const update_data = {
                payment_status: status,
                updated_at: Math.floor(Date.now() / 1000)
            };
            
            if (status === 'completed') {
                update_data.completed_at = Math.floor(Date.now() / 1000);
            }
            
            if (transaction_id) {
                update_data.transaction_id = transaction_id;
            }
            
            return await payment_model.findByIdAndUpdate(
                payment_id,
                update_data,
                { new: true }
            );
        } catch (error) {
            console.error(`FILE: payment.data_repository.js | update_payment_status | Error:`, error);
            throw error;
        }
    }
}

module.exports = new payment_data_repository();
