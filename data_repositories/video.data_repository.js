/**
 * Video Data Repository
 * Handles all database operations for videos table
 */

const video_model = require('../models/video.model');
const mongoose = require('mongoose');

class video_data_repository {
    constructor() {
        console.log('FILE: video.data_repository.js | constructor | Data Repository initialized');
    }

    /**
     * Create a new video
     */
    async create_video(video_data) {
        try {
            console.log(`FILE: video.data_repository.js | create_video | Creating new video: ${video_data.video_name}`);
            const new_video = new video_model(video_data);
            return await new_video.save();
        } catch (error) {
            console.error(`FILE: video.data_repository.js | create_video | Error:`, error);
            throw error;
        }
    }

    /**
     * Get video by ID
     */
    async get_video_by_id(video_id) {
        try {
            console.log(`FILE: video.data_repository.js | get_video_by_id | Fetching video: ${video_id}`);
            // Ensure user model is loaded before populating
            const user_model = require('../models/user.model');
            return await video_model.findOne({ _id: video_id, is_active: 1 })
                .populate({
                    path: 'uploaded_by',
                    select: 'name email',
                    model: user_model
                });
        } catch (error) {
            console.error(`FILE: video.data_repository.js | get_video_by_id | Error:`, error);
            throw error;
        }
    }

    /**
     * Get all videos with filters
     */
    async get_videos(filters = {}, page = 1, limit = 20) {
        try {
            console.log(`FILE: video.data_repository.js | get_videos | Fetching videos with filters:`, filters);
            
            // Ensure user model is loaded before populating
            const user_model = require('../models/user.model');
            
            const skip = (page - 1) * limit;
            const query = { is_active: 1, ...filters };

            const videos = await video_model.find(query)
                .populate({
                    path: 'uploaded_by',
                    select: 'name email',
                    model: user_model
                })
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit);

            const total = await video_model.countDocuments(query);

            return {
                videos: videos,
                total: total,
                page: page,
                total_pages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error(`FILE: video.data_repository.js | get_videos | Error:`, error);
            throw error;
        }
    }

    /**
     * Get videos by country
     */
    async get_videos_by_country(country, page = 1, limit = 20, exclude_video_id = null) {
        try {
            console.log(`FILE: video.data_repository.js | get_videos_by_country | Fetching videos for country: ${country}`);
            
            const skip = (page - 1) * limit;
            const query = { 
                is_active: 1, 
                country: country 
            };

            // Exclude specific video if provided (useful for suggestions)
            if (exclude_video_id) {
                // Convert string ID to ObjectId if needed
                const exclude_id = mongoose.Types.ObjectId.isValid(exclude_video_id) 
                    ? new mongoose.Types.ObjectId(exclude_video_id) 
                    : exclude_video_id;
                query._id = { $ne: exclude_id };
            }

            // Ensure user model is loaded before populating
            const user_model = require('../models/user.model');
            
            const videos = await video_model.find(query)
                .populate({
                    path: 'uploaded_by',
                    select: 'name email',
                    model: user_model
                })
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit);

            const total = await video_model.countDocuments(query);

            return {
                videos: videos,
                total: total,
                page: page,
                total_pages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error(`FILE: video.data_repository.js | get_videos_by_country | Error:`, error);
            throw error;
        }
    }

    /**
     * Search videos by name or description
     */
    async search_videos(search_term, page = 1, limit = 20) {
        try {
            console.log(`FILE: video.data_repository.js | search_videos | Searching for: ${search_term}`);
            
            const skip = (page - 1) * limit;
            
            // Ensure user model is loaded before populating
            const user_model = require('../models/user.model');
            
            const videos = await video_model.find({
                is_active: 1,
                $text: { $search: search_term }
            })
            .populate({
                path: 'uploaded_by',
                select: 'name email',
                model: user_model
            })
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(limit);

            const total = await video_model.countDocuments({
                is_active: 1,
                $text: { $search: search_term }
            });

            return {
                videos: videos,
                total: total,
                page: page,
                total_pages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error(`FILE: video.data_repository.js | search_videos | Error:`, error);
            throw error;
        }
    }

    /**
     * Update video
     */
    async update_video(video_id, update_data) {
        try {
            console.log(`FILE: video.data_repository.js | update_video | Updating video: ${video_id}`);
            // Ensure user model is loaded before populating
            const user_model = require('../models/user.model');
            
            return await video_model.findByIdAndUpdate(
                video_id,
                { ...update_data, updated_at: Math.floor(Date.now() / 1000) },
                { new: true }
            ).populate({
                path: 'uploaded_by',
                select: 'name email',
                model: user_model
            });
        } catch (error) {
            console.error(`FILE: video.data_repository.js | update_video | Error:`, error);
            throw error;
        }
    }

    /**
     * Delete video (soft delete)
     */
    async delete_video(video_id) {
        try {
            console.log(`FILE: video.data_repository.js | delete_video | Deleting video: ${video_id}`);
            return await video_model.findByIdAndUpdate(
                video_id,
                { is_active: 0, updated_at: Math.floor(Date.now() / 1000) },
                { new: true }
            );
        } catch (error) {
            console.error(`FILE: video.data_repository.js | delete_video | Error:`, error);
            throw error;
        }
    }

    /**
     * Increment view count
     */
    async increment_view_count(video_id) {
        try {
            console.log(`FILE: video.data_repository.js | increment_view_count | Incrementing views for video: ${video_id}`);
            return await video_model.findByIdAndUpdate(
                video_id,
                { $inc: { view_count: 1 } },
                { new: true }
            );
        } catch (error) {
            console.error(`FILE: video.data_repository.js | increment_view_count | Error:`, error);
            throw error;
        }
    }

    /**
     * Get unique countries
     */
    async get_all_countries() {
        try {
            console.log(`FILE: video.data_repository.js | get_all_countries | Fetching all countries`);
            return await video_model.distinct('country', { is_active: 1 });
        } catch (error) {
            console.error(`FILE: video.data_repository.js | get_all_countries | Error:`, error);
            throw error;
        }
    }
}

module.exports = new video_data_repository();

