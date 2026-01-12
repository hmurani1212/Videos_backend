/**
 * Authentication Service
 * Handles user authentication, registration, and JWT operations
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user_data_repository = require('../data_repositories/user.data_repository');

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRY = '7d'; // 7 days

class auth_service {
    constructor() {
        console.log('FILE: auth.service.js | constructor | Service initialized');
    }

    /**
     * Register a new user
     */
    async register_user(user_data) {
        try {
            console.log(`FILE: auth.service.js | register_user | Registering user: ${user_data.email}`);

            // Check if user already exists
            const existing_user = await user_data_repository.get_user_by_email(user_data.email);
            if (existing_user) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-02001",
                    ERROR_DESCRIPTION: "User with this email already exists"
                };
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashed_password = await bcrypt.hash(user_data.password, salt);

            // Create user
            const new_user = await user_data_repository.create_user({
                name: user_data.name,
                email: user_data.email,
                password: hashed_password,
                country: user_data.country || null,
                role: user_data.role || 'user'
            });

            // Generate JWT token
            const token = this.generate_token(new_user);

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: {
                    user: {
                        _id: new_user._id,
                        name: new_user.name,
                        email: new_user.email,
                        country: new_user.country,
                        role: new_user.role
                    },
                    token: token
                }
            };
        } catch (error) {
            console.error(`FILE: auth.service.js | register_user | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-02002",
                ERROR_DESCRIPTION: error.message || "Failed to register user"
            };
        }
    }

    /**
     * Login user
     */
    async login_user(email, password) {
        try {
            console.log(`FILE: auth.service.js | login_user | Login attempt for: ${email}`);

            // Get user by email
            const user = await user_data_repository.get_user_by_email(email);
            if (!user) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-02003",
                    ERROR_DESCRIPTION: "Invalid email or password"
                };
            }

            // Verify password
            const is_valid = await bcrypt.compare(password, user.password);
            if (!is_valid) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-02004",
                    ERROR_DESCRIPTION: "Invalid email or password"
                };
            }

            // Generate JWT token
            const token = this.generate_token(user);

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        country: user.country,
                        role: user.role
                    },
                    token: token
                }
            };
        } catch (error) {
            console.error(`FILE: auth.service.js | login_user | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-02005",
                ERROR_DESCRIPTION: error.message || "Failed to login"
            };
        }
    }

    /**
     * Generate JWT token
     */
    generate_token(user) {
        try {
            const payload = {
                user_id: user._id,
                email: user.email,
                role: user.role
            };

            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        } catch (error) {
            console.error(`FILE: auth.service.js | generate_token | Error:`, error);
            throw error;
        }
    }

    /**
     * Verify JWT token
     */
    verify_token(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            console.error(`FILE: auth.service.js | verify_token | Error:`, error);
            return null;
        }
    }

    /**
     * Get user by token
     */
    async get_user_by_token(token) {
        try {
            const decoded = this.verify_token(token);
            if (!decoded) {
                return null;
            }

            const user = await user_data_repository.get_user_by_id(decoded.user_id);
            return user;
        } catch (error) {
            console.error(`FILE: auth.service.js | get_user_by_token | Error:`, error);
            return null;
        }
    }
}

module.exports = new auth_service();

