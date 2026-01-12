/**
 * Comment Data Repository
 * Handles all database operations for comments table
 */

const comment_model = require('../models/comment.model');

class comment_data_repository {
    constructor() {
        console.log('FILE: comment.data_repository.js | constructor | Data Repository initialized');
    }

    /**
     * Create a new comment
     */
    async create_comment(comment_data) {
        try {
            console.log(`FILE: comment.data_repository.js | create_comment | Creating new comment for video: ${comment_data.video_id}`);
            const new_comment = new comment_model(comment_data);
            return await new_comment.save();
        } catch (error) {
            console.error(`FILE: comment.data_repository.js | create_comment | Error:`, error);
            throw error;
        }
    }

    /**
     * Get comments by video ID
     */
    async get_comments_by_video(video_id, page = 1, limit = 50) {
        try {
            console.log(`FILE: comment.data_repository.js | get_comments_by_video | Fetching comments for video: ${video_id}`);
            
            const skip = (page - 1) * limit;
            
            // Ensure user model is loaded before populating
            const user_model = require('../models/user.model');
            
            const comments = await comment_model.find({
                video_id: video_id,
                is_active: 1
            })
            .populate({
                path: 'user_id',
                select: 'name email',
                model: user_model
            })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

            const total = await comment_model.countDocuments({
                video_id: video_id,
                is_active: 1
            });

            return {
                comments: comments,
                total: total,
                page: page,
                total_pages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error(`FILE: comment.data_repository.js | get_comments_by_video | Error:`, error);
            throw error;
        }
    }

    /**
     * Delete comment (soft delete)
     */
    async delete_comment(comment_id) {
        try {
            console.log(`FILE: comment.data_repository.js | delete_comment | Deleting comment: ${comment_id}`);
            return await comment_model.findByIdAndUpdate(
                comment_id,
                { is_active: 0, updated_at: Math.floor(Date.now() / 1000) },
                { new: true }
            );
        } catch (error) {
            console.error(`FILE: comment.data_repository.js | delete_comment | Error:`, error);
            throw error;
        }
    }

    /**
     * Get comment by ID
     */
    async get_comment_by_id(comment_id) {
        try {
            console.log(`FILE: comment.data_repository.js | get_comment_by_id | Fetching comment: ${comment_id}`);
            // Ensure user model is loaded before populating
            const user_model = require('../models/user.model');
            return await comment_model.findOne({ _id: comment_id, is_active: 1 })
                .populate({
                    path: 'user_id',
                    select: 'name email',
                    model: user_model
                });
        } catch (error) {
            console.error(`FILE: comment.data_repository.js | get_comment_by_id | Error:`, error);
            throw error;
        }
    }
}

module.exports = new comment_data_repository();

