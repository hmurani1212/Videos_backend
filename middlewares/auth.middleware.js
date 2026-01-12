/**
 * Authentication Middleware
 * Handles JWT verification and user authentication
 */

const auth_service = require('../services/auth.service');

class auth_middleware {
    /**
     * Verify JWT token and authenticate user
     */
    async authenticate(req, res, next) {
        try {
            console.log(`FILE: auth.middleware.js | authenticate | Authenticating request`);

            // Get token from header
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-05001",
                    ERROR_DESCRIPTION: "No authentication token provided"
                });
            }

            // Verify token
            const decoded = auth_service.verify_token(token);
            if (!decoded) {
                return res.status(401).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-05002",
                    ERROR_DESCRIPTION: "Invalid or expired token"
                });
            }

            // Attach user info to request
            req.user = decoded;
            next();
        } catch (error) {
            console.error(`FILE: auth.middleware.js | authenticate | Error:`, error);
            return res.status(401).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-05003",
                ERROR_DESCRIPTION: "Authentication failed"
            });
        }
    }

    /**
     * Optional authentication - doesn't fail if token is missing
     */
    async authenticate_optional(req, res, next) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (token) {
                const decoded = auth_service.verify_token(token);
                if (decoded) {
                    req.user = decoded;
                }
            }

            next();
        } catch (error) {
            console.error(`FILE: auth.middleware.js | authenticate_optional | Error:`, error);
            next();
        }
    }

    /**
     * Verify user is admin
     */
    async verify_admin(req, res, next) {
        try {
            console.log(`FILE: auth.middleware.js | verify_admin | Verifying admin access`);

            if (!req.user) {
                return res.status(401).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-05004",
                    ERROR_DESCRIPTION: "Authentication required"
                });
            }

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-05005",
                    ERROR_DESCRIPTION: "Admin access required"
                });
            }

            next();
        } catch (error) {
            console.error(`FILE: auth.middleware.js | verify_admin | Error:`, error);
            return res.status(403).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-05006",
                ERROR_DESCRIPTION: "Admin verification failed"
            });
        }
    }
}

module.exports = new auth_middleware();

