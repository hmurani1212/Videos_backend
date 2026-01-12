/**
 * User Data Repository
 * Handles all database operations for users table
 */

const user_model = require('../models/user.model');

class user_data_repository {
    constructor() {
        console.log('FILE: user.data_repository.js | constructor | Data Repository initialized');
    }

    /**
     * Create a new user
     */
    async create_user(user_data) {
        try {
            console.log(`FILE: user.data_repository.js | create_user | Creating new user: ${user_data.email}`);
            const new_user = new user_model(user_data);
            return await new_user.save();
        } catch (error) {
            console.error(`FILE: user.data_repository.js | create_user | Error:`, error);
            throw error;
        }
    }

    /**
     * Get user by email
     */
    async get_user_by_email(email) {
        try {
            console.log(`FILE: user.data_repository.js | get_user_by_email | Fetching user: ${email}`);
            return await user_model.findOne({ email: email, is_active: 1 });
        } catch (error) {
            console.error(`FILE: user.data_repository.js | get_user_by_email | Error:`, error);
            throw error;
        }
    }

    /**
     * Get user by ID
     */
    async get_user_by_id(user_id) {
        try {
            console.log(`FILE: user.data_repository.js | get_user_by_id | Fetching user: ${user_id}`);
            return await user_model.findOne({ _id: user_id, is_active: 1 }).select('-password');
        } catch (error) {
            console.error(`FILE: user.data_repository.js | get_user_by_id | Error:`, error);
            throw error;
        }
    }

    /**
     * Update user
     */
    async update_user(user_id, update_data) {
        try {
            console.log(`FILE: user.data_repository.js | update_user | Updating user: ${user_id}`);
            return await user_model.findByIdAndUpdate(
                user_id,
                { ...update_data, updated_at: Math.floor(Date.now() / 1000) },
                { new: true }
            ).select('-password');
        } catch (error) {
            console.error(`FILE: user.data_repository.js | update_user | Error:`, error);
            throw error;
        }
    }
}

module.exports = new user_data_repository();

