/**
 * Comment Controller
 * Handles comment-related requests
 */

const comment_service = require('../services/comment.service');

class comment_controller {
    /**
     * Create new comment
     */
    async create_comment(req, res) {
        try {
            console.log(`FILE: comment.controller.js | create_comment | Creating comment`);

            const { video_id, comment_text } = req.body;

            // Validate required fields
            if (!video_id || !comment_text) {
                return res.status(400).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "INVALID_REQUEST",
                    ERROR_CODE: "VTAPP-09001",
                    ERROR_DESCRIPTION: "Video ID and comment text are required"
                });
            }

            // Call service
            const result = await comment_service.create_comment(
                { video_id, comment_text },
                req.user.user_id
            );

            if (result.STATUS === "ERROR") {
                return res.status(400).json(result);
            }

            return res.status(201).json(result);
        } catch (error) {
            console.error(`FILE: comment.controller.js | create_comment | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-09002",
                ERROR_DESCRIPTION: "Failed to create comment"
            });
        }
    }

    /**
     * Get comments by video ID
     */
    async get_comments_by_video(req, res) {
        try {
            console.log(`FILE: comment.controller.js | get_comments_by_video | Fetching comments`);

            const { video_id } = req.params;
            const { page = 1, limit = 50 } = req.query;

            const result = await comment_service.get_comments_by_video(
                video_id,
                parseInt(page),
                parseInt(limit)
            );

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: comment.controller.js | get_comments_by_video | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-09003",
                ERROR_DESCRIPTION: "Failed to fetch comments"
            });
        }
    }

    /**
     * Delete comment
     */
    async delete_comment(req, res) {
        try {
            console.log(`FILE: comment.controller.js | delete_comment | Deleting comment`);

            const { comment_id } = req.params;

            const result = await comment_service.delete_comment(
                comment_id,
                req.user.user_id,
                req.user.role
            );

            if (result.STATUS === "ERROR") {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: comment.controller.js | delete_comment | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-09004",
                ERROR_DESCRIPTION: "Failed to delete comment"
            });
        }
    }
}

module.exports = new comment_controller();

