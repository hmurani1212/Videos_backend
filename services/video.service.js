/**
 * Video Service
 * Handles all video-related business logic
 */

const video_data_repository = require('../data_repositories/video.data_repository');
const video_view_data_repository = require('../data_repositories/video_view.data_repository');
const cloudinary_service = require('./cloudinary.service');
const video_thumbnail_service = require('./video_thumbnail.service');

class video_service {
    constructor() {
        console.log('FILE: video.service.js | constructor | Service initialized');
    }

    /**
     * Create a new video
     */
    async create_video(video_data, user_id) {
        try {
            console.log(`FILE: video.service.js | create_video | Creating video: ${video_data.video_name}`);

            // Upload video to Cloudinary
            const upload_result = await cloudinary_service.upload_video(
                video_data.video_file,
                'pay_videos',
                null
            );

            if (upload_result.STATUS === "ERROR") {
                return upload_result;
            }

            // Create video record in database
            const new_video = await video_data_repository.create_video({
                video_name: video_data.video_name,
                description: video_data.description,
                country: video_data.country,
                video_url: upload_result.DB_DATA.url,
                cloudinary_public_id: upload_result.DB_DATA.public_id,
                thumbnail_url: upload_result.DB_DATA.thumbnail_url,
                duration: upload_result.DB_DATA.duration,
                uploaded_by: user_id
            });

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: new_video
            };
        } catch (error) {
            console.error(`FILE: video.service.js | create_video | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-03001",
                ERROR_DESCRIPTION: error.message || "Failed to create video"
            };
        }
    }

    /**
     * Get video by ID
     */
    async get_video_by_id(video_id, user_id = null) {
        try {
            console.log(`FILE: video.service.js | get_video_by_id | Fetching video: ${video_id}`);

            const video = await video_data_repository.get_video_by_id(video_id);
            if (!video) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "NOT_FOUND",
                    ERROR_CODE: "VTAPP-03002",
                    ERROR_DESCRIPTION: "Video not found"
                };
            }

            // Check if user has viewed this video
            let has_viewed = false;
            if (user_id) {
                has_viewed = await video_view_data_repository.has_user_viewed(video_id, user_id);
            }

            // Ensure thumbnail exists
            const video_obj = video.toObject();
            if (!video_obj.thumbnail_url && video_obj.video_url) {
                video_obj.thumbnail_url = video_thumbnail_service.generate_thumbnail_url(video_obj.video_url);
            }

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: {
                    ...video_obj,
                    has_viewed: has_viewed
                }
            };
        } catch (error) {
            console.error(`FILE: video.service.js | get_video_by_id | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-03003",
                ERROR_DESCRIPTION: error.message || "Failed to fetch video"
            };
        }
    }

    /**
     * Get all videos with filters
     */
    async get_videos(filters = {}, page = 1, limit = 20) {
        try {
            console.log(`FILE: video.service.js | get_videos | Fetching videos`);

            const result = await video_data_repository.get_videos(filters, page, limit);

            // Ensure thumbnails exist for all videos
            if (result.videos && Array.isArray(result.videos)) {
                result.videos = result.videos.map(video => {
                    const video_obj = video.toObject ? video.toObject() : video;
                    if (!video_obj.thumbnail_url && video_obj.video_url) {
                        video_obj.thumbnail_url = video_thumbnail_service.generate_thumbnail_url(video_obj.video_url);
                    }
                    return video_obj;
                });
            }

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: result
            };
        } catch (error) {
            console.error(`FILE: video.service.js | get_videos | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-03004",
                ERROR_DESCRIPTION: error.message || "Failed to fetch videos"
            };
        }
    }

    /**
     * Get videos by country
     */
    async get_videos_by_country(country, page = 1, limit = 20, exclude_video_id = null) {
        try {
            console.log(`FILE: video.service.js | get_videos_by_country | Fetching videos for: ${country}`);

            const result = await video_data_repository.get_videos_by_country(
                country,
                page,
                limit,
                exclude_video_id
            );

            // Ensure thumbnails exist for all videos
            const videos_with_thumbnails = result.videos.map(video => {
                const video_obj = video.toObject ? video.toObject() : video;
                if (!video_obj.thumbnail_url && video_obj.video_url) {
                    video_obj.thumbnail_url = video_thumbnail_service.generate_thumbnail_url(video_obj.video_url);
                }
                return video_obj;
            });

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: {
                    videos: videos_with_thumbnails,
                    total: result.total,
                    page: result.page,
                    total_pages: result.total_pages
                }
            };
        } catch (error) {
            console.error(`FILE: video.service.js | get_videos_by_country | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-03005",
                ERROR_DESCRIPTION: error.message || "Failed to fetch videos"
            };
        }
    }

    /**
     * Search videos
     */
    async search_videos(search_term, page = 1, limit = 20) {
        try {
            console.log(`FILE: video.service.js | search_videos | Searching: ${search_term}`);

            const result = await video_data_repository.search_videos(search_term, page, limit);

            // Ensure thumbnails exist for all videos
            if (result.videos && Array.isArray(result.videos)) {
                result.videos = result.videos.map(video => {
                    const video_obj = video.toObject ? video.toObject() : video;
                    if (!video_obj.thumbnail_url && video_obj.video_url) {
                        video_obj.thumbnail_url = video_thumbnail_service.generate_thumbnail_url(video_obj.video_url);
                    }
                    return video_obj;
                });
            }

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: result
            };
        } catch (error) {
            console.error(`FILE: video.service.js | search_videos | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-03006",
                ERROR_DESCRIPTION: error.message || "Failed to search videos"
            };
        }
    }

    /**
     * Update video
     */
    async update_video(video_id, update_data, user_id) {
        try {
            console.log(`FILE: video.service.js | update_video | Updating video: ${video_id}`);

            // Get existing video
            const video = await video_data_repository.get_video_by_id(video_id);
            if (!video) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "NOT_FOUND",
                    ERROR_CODE: "VTAPP-03007",
                    ERROR_DESCRIPTION: "Video not found"
                };
            }

            // Check if user is admin or owner
            if (video.uploaded_by._id.toString() !== user_id.toString()) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-03008",
                    ERROR_DESCRIPTION: "You don't have permission to update this video"
                };
            }

            // Update video
            const updated_video = await video_data_repository.update_video(video_id, update_data);

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: updated_video
            };
        } catch (error) {
            console.error(`FILE: video.service.js | update_video | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-03009",
                ERROR_DESCRIPTION: error.message || "Failed to update video"
            };
        }
    }

    /**
     * Delete video
     */
    async delete_video(video_id, user_id) {
        try {
            console.log(`FILE: video.service.js | delete_video | Deleting video: ${video_id}`);

            // Get existing video
            const video = await video_data_repository.get_video_by_id(video_id);
            if (!video) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "NOT_FOUND",
                    ERROR_CODE: "VTAPP-03010",
                    ERROR_DESCRIPTION: "Video not found"
                };
            }

            // Check if user is admin or owner
            if (video.uploaded_by._id.toString() !== user_id.toString()) {
                return {
                    STATUS: "ERROR",
                    ERROR_FILTER: "USER_END_VIOLATION",
                    ERROR_CODE: "VTAPP-03011",
                    ERROR_DESCRIPTION: "You don't have permission to delete this video"
                };
            }

            // Delete from Cloudinary
            await cloudinary_service.delete_video(video.cloudinary_public_id);

            // Soft delete from database
            await video_data_repository.delete_video(video_id);

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: { deleted: true }
            };
        } catch (error) {
            console.error(`FILE: video.service.js | delete_video | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-03012",
                ERROR_DESCRIPTION: error.message || "Failed to delete video"
            };
        }
    }

    /**
     * Record video view
     */
    async record_view(video_id, user_id) {
        try {
            console.log(`FILE: video.service.js | record_view | Recording view for video: ${video_id}`);

            // Check if user has already viewed
            const has_viewed = await video_view_data_repository.has_user_viewed(video_id, user_id);
            
            if (!has_viewed) {
                // Record the view
                await video_view_data_repository.record_view(video_id, user_id);
                
                // Increment view count
                await video_data_repository.increment_view_count(video_id);
            }

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: { 
                    viewed: true,
                    first_time_view: !has_viewed
                }
            };
        } catch (error) {
            console.error(`FILE: video.service.js | record_view | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-03013",
                ERROR_DESCRIPTION: error.message || "Failed to record view"
            };
        }
    }

    /**
     * Get all countries
     */
    async get_all_countries() {
        try {
            console.log(`FILE: video.service.js | get_all_countries | Fetching all countries`);

            const countries = await video_data_repository.get_all_countries();

            return {
                STATUS: "SUCCESSFUL",
                ERROR_CODE: "",
                ERROR_FILTER: "",
                ERROR_DESCRIPTION: "",
                DB_DATA: countries
            };
        } catch (error) {
            console.error(`FILE: video.service.js | get_all_countries | Error:`, error);
            return {
                STATUS: "ERROR",
                ERROR_FILTER: "TECHNICAL_ISSUE",
                ERROR_CODE: "VTAPP-03014",
                ERROR_DESCRIPTION: error.message || "Failed to fetch countries"
            };
        }
    }
}

module.exports = new video_service();

