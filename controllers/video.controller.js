/**
 * Video Controller
 * Handles video-related requests
 */

const video_service = require('../services/video.service');

class video_controller {
    /**
     * Create new video (Admin only)
     */
    async create_video(req, res) {
        try {
            console.log(`FILE: video.controller.js | create_video | Creating video`);

            const { video_name, description, country } = req.body;

            // Validate required fields
            if (!video_name || !description || !country) {
                return res.status(400).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "INVALID_REQUEST",
                    ERROR_CODE: "VTAPP-08001",
                    ERROR_DESCRIPTION: "Video name, description, and country are required"
                });
            }

            // File is available in req.file from multer middleware
            const video_data = {
                video_name,
                description,
                country,
                video_file: req.file.buffer
            };

            // Call service
            const result = await video_service.create_video(video_data, req.user.user_id);

            if (result.STATUS === "ERROR") {
                return res.status(400).json(result);
            }

            return res.status(201).json(result);
        } catch (error) {
            console.error(`FILE: video.controller.js | create_video | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-08002",
                ERROR_DESCRIPTION: "Failed to create video"
            });
        }
    }

    /**
     * Get all videos
     */
    async get_videos(req, res) {
        try {
            console.log(`FILE: video.controller.js | get_videos | Fetching videos`);

            const { country, page = 1, limit = 20 } = req.query;

            let filters = {};
            if (country) {
                filters.country = country;
            }

            const result = await video_service.get_videos(filters, parseInt(page), parseInt(limit));

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: video.controller.js | get_videos | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-08003",
                ERROR_DESCRIPTION: "Failed to fetch videos"
            });
        }
    }

    /**
     * Get video by ID
     */
    async get_video_by_id(req, res) {
        try {
            console.log(`FILE: video.controller.js | get_video_by_id | Fetching video`);

            const { video_id } = req.params;
            const user_id = req.user?.user_id || null;

            const result = await video_service.get_video_by_id(video_id, user_id);

            if (result.STATUS === "ERROR") {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: video.controller.js | get_video_by_id | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-08004",
                ERROR_DESCRIPTION: "Failed to fetch video"
            });
        }
    }

    /**
     * Get videos by country
     */
    async get_videos_by_country(req, res) {
        try {
            console.log(`FILE: video.controller.js | get_videos_by_country | Fetching videos by country`);

            const { country } = req.params;
            const { page = 1, limit = 20, exclude_video_id } = req.query;

            const result = await video_service.get_videos_by_country(
                country,
                parseInt(page),
                parseInt(limit),
                exclude_video_id
            );

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: video.controller.js | get_videos_by_country | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-08005",
                ERROR_DESCRIPTION: "Failed to fetch videos"
            });
        }
    }

    /**
     * Search videos
     */
    async search_videos(req, res) {
        try {
            console.log(`FILE: video.controller.js | search_videos | Searching videos`);

            const { q, page = 1, limit = 20 } = req.query;

            if (!q) {
                return res.status(400).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "INVALID_REQUEST",
                    ERROR_CODE: "VTAPP-08006",
                    ERROR_DESCRIPTION: "Search query is required"
                });
            }

            const result = await video_service.search_videos(q, parseInt(page), parseInt(limit));

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: video.controller.js | search_videos | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-08007",
                ERROR_DESCRIPTION: "Failed to search videos"
            });
        }
    }

    /**
     * Update video (Admin only)
     */
    async update_video(req, res) {
        try {
            console.log(`FILE: video.controller.js | update_video | Updating video`);

            const { video_id } = req.params;
            const update_data = req.body;

            const result = await video_service.update_video(video_id, update_data, req.user.user_id);

            if (result.STATUS === "ERROR") {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: video.controller.js | update_video | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-08008",
                ERROR_DESCRIPTION: "Failed to update video"
            });
        }
    }

    /**
     * Delete video (Admin only)
     */
    async delete_video(req, res) {
        try {
            console.log(`FILE: video.controller.js | delete_video | Deleting video`);

            const { video_id } = req.params;

            const result = await video_service.delete_video(video_id, req.user.user_id);

            if (result.STATUS === "ERROR") {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: video.controller.js | delete_video | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-08009",
                ERROR_DESCRIPTION: "Failed to delete video"
            });
        }
    }

    /**
     * Record video view
     */
    async record_view(req, res) {
        try {
            console.log(`FILE: video.controller.js | record_view | Recording view`);

            const { video_id } = req.params;
            const user_id = req.user.user_id;

            const result = await video_service.record_view(video_id, user_id);

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: video.controller.js | record_view | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-08010",
                ERROR_DESCRIPTION: "Failed to record view"
            });
        }
    }

    /**
     * Get all countries
     */
    async get_countries(req, res) {
        try {
            console.log(`FILE: video.controller.js | get_countries | Fetching countries`);

            const result = await video_service.get_all_countries();

            return res.status(200).json(result);
        } catch (error) {
            console.error(`FILE: video.controller.js | get_countries | Error:`, error);
            return res.status(500).json({
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-08011",
                ERROR_DESCRIPTION: "Failed to fetch countries"
            });
        }
    }
}

module.exports = new video_controller();

