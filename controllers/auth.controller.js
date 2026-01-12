/**
 * Authentication Controller
 * Handles authentication-related requests
 */

const auth_service = require('../services/auth.service');

class auth_controller {
    /**
     * Register new user
     */
    async register(req, res) {
        try {
            console.log(`FILE: auth.controller.js | register | Registration request received`);

            const { name, email, password, country, age } = req.body;

            // Validate required fields
            if (!name || !email || !password) {
                return res.status(400).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "INVALID_REQUEST",
                    ERROR_CODE: "VTAPP-07001",
                    ERROR_DESCRIPTION: "Name, email, and password are required"
                });
            }

            // Call service
            const result = await auth_service.register_user({
                name,
                email,
                password,
                country,
                age: age ? parseInt(age) : null,
                role: 'user' // Default role
            });

            if (result.STATUS === "ERROR") {
                return res.status(400).json(result);
            }

            return res.status(201).json(result);
        } catch (error) {
            console.error(`FILE: auth.controller.js | register | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-07002",
                ERROR_DESCRIPTION: "Registration failed"
            });
        }
    }

    /**
     * Login user
     */
    async login(req, res) {
        try {
            console.log(`FILE: auth.controller.js | login | Login request received`);

            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "INVALID_REQUEST",
                    ERROR_CODE: "VTAPP-07003",
                    ERROR_DESCRIPTION: "Email and password are required"
                });
            }

            // Call service
            const result = await auth_service.login_user(email, password);

            if (result.STATUS === "ERROR") {
                return res.status(401).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: auth.controller.js | login | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-07004",
                ERROR_DESCRIPTION: "Login failed"
            });
        }
    }

    /**
     * Get current user info
     */
    async get_current_user(req, res) {
        try {
            console.log(`FILE: auth.controller.js | get_current_user | Fetching current user`);

            return res.status(200).json({
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: {
                    user: req.user
                }
            });
        } catch (error) {
            console.error(`FILE: auth.controller.js | get_current_user | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-07005",
                ERROR_DESCRIPTION: "Failed to fetch user"
            });
        }
    }
}

module.exports = new auth_controller();

