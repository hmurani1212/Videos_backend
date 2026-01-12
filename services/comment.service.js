/**
 * Comment Service
 * Handles all comment-related business logic
 */

const comment_data_repository = require('../data_repositories/comment.data_repository');
const video_data_repository = require('../data_repositories/video.data_repository');

class comment_service {
    constructor() {
        console.log('FILE: comment.service.js | constructor | Service initialized');
    }

    /**
     * Create a new comment
     */
    async create_comment(comment_data, user_id) {
        try {
            console.log(`FILE: comment.service.js | create_comment | Creating comment for video: ${comment_data.video_id}`);

            // Verify video exists
            const video = await video_data_repository.get_video_by_id(comment_data.video_id);
            if (!video) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "NOT_FOUND",
                    ERROR_CODE: "VTAPP-04001",
                    ERROR_DESCRIPTION: "Video not found"
                };
            }

            // Create comment
            const new_comment = await comment_data_repository.create_comment({
                video_id: comment_data.video_id,
                user_id: user_id,
                comment_text: comment_data.comment_text
            });

            // Populate user data
            const comment_with_user = await comment_data_repository.get_comment_by_id(new_comment._id);

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: comment_with_user
            };
        } catch (error) {
            console.error(`FILE: comment.service.js | create_comment | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-04002",
                ERROR_DESCRIPTION: error.message || "Failed to create comment"
            };
        }
    }

    /**
     * Get comments for a video
     */
    async get_comments_by_video(video_id, page = 1, limit = 50) {
        try {
            console.log(`FILE: comment.service.js | get_comments_by_video | Fetching comments for video: ${video_id}`);

            const result = await comment_data_repository.get_comments_by_video(video_id, page, limit);

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: result
            };
        } catch (error) {
            console.error(`FILE: comment.service.js | get_comments_by_video | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-04003",
                ERROR_DESCRIPTION: error.message || "Failed to fetch comments"
            };
        }
    }

    /**
     * Delete comment
     */
    async delete_comment(comment_id, user_id, user_role) {
        try {
            console.log(`FILE: comment.service.js | delete_comment | Deleting comment: ${comment_id}`);

            // Get comment
            const comment = await comment_data_repository.get_comment_by_id(comment_id);
            if (!comment) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "NOT_FOUND",
                    ERROR_CODE: "VTAPP-04004",
                    ERROR_DESCRIPTION: "Comment not found"
                };
            }

            // Check if user is admin or comment owner
            if (user_role !== 'admin' && comment.user_id._id.toString() !== user_id.toString()) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-04005",
                    ERROR_DESCRIPTION: "You don't have permission to delete this comment"
                };
            }

            // Delete comment
            await comment_data_repository.delete_comment(comment_id);

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: { deleted: true }
            };
        } catch (error) {
            console.error(`FILE: comment.service.js | delete_comment | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-04006",
                ERROR_DESCRIPTION: error.message || "Failed to delete comment"
            };
        }
    }
}

module.exports = new comment_service();

