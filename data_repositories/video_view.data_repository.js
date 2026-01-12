/**
 * Video View Data Repository
 * Handles all database operations for video views tracking
 */

const video_view_model = require('../models/video_view.model');

class video_view_data_repository {
    constructor() {
        console.log('FILE: video_view.data_repository.js | constructor | Data Repository initialized');
    }

    /**
     * Record a video view
     */
    async record_view(video_id, user_id) {
        try {
            console.log(`FILE: video_view.data_repository.js | record_view | Recording view for video: ${video_id} by user: ${user_id}`);
            
            // Use findOneAndUpdate with upsert to avoid duplicates
            const view = await video_view_model.findOneAndUpdate(
                { video_id: video_id, user_id: user_id },
                { 
                    video_id: video_id, 
                    user_id: user_id,
                    viewed_at: Math.floor(Date.now() / 1000)
                },
                { upsert: true, new: true }
            );

            return view;
        } catch (error) {
            console.error(`FILE: video_view.data_repository.js | record_view | Error:`, error);
            throw error;
        }
    }

    /**
     * Check if user has viewed a video
     */
    async has_user_viewed(video_id, user_id) {
        try {
            console.log(`FILE: video_view.data_repository.js | has_user_viewed | Checking view for video: ${video_id} by user: ${user_id}`);
            
            const view = await video_view_model.findOne({
                video_id: video_id,
                user_id: user_id
            });

            return view !== null;
        } catch (error) {
            console.error(`FILE: video_view.data_repository.js | has_user_viewed | Error:`, error);
            throw error;
        }
    }

    /**
     * Get view count for a video
     */
    async get_view_count(video_id) {
        try {
            console.log(`FILE: video_view.data_repository.js | get_view_count | Getting view count for video: ${video_id}`);
            
            return await video_view_model.countDocuments({ video_id: video_id });
        } catch (error) {
            console.error(`FILE: video_view.data_repository.js | get_view_count | Error:`, error);
            throw error;
        }
    }

    /**
     * Get count of videos viewed by user
     */
    async get_user_viewed_count(user_id) {
        try {
            console.log(`FILE: video_view.data_repository.js | get_user_viewed_count | Getting viewed count for user: ${user_id}`);
            
            return await video_view_model.countDocuments({ user_id: user_id });
        } catch (error) {
            console.error(`FILE: video_view.data_repository.js | get_user_viewed_count | Error:`, error);
            throw error;
        }
    }
}

module.exports = new video_view_data_repository();

