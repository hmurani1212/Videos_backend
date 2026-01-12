/**
 * Video Thumbnail Service
 * Generates thumbnail URLs from Cloudinary video URLs
 */

const { cloudinary } = require("../global_config/cloudinary_config");

class video_thumbnail_service {
    constructor() {
        console.log('FILE: video_thumbnail.service.js | constructor | Service initialized');
    }

    /**
     * Generate thumbnail URL from Cloudinary video URL
     * @param {String} video_url - Cloudinary video URL
     * @param {Number} offset - Time offset in seconds (default: 1)
     * @returns {String} Thumbnail URL
     */
    generate_thumbnail_url(video_url, offset = 1) {
        try {
            if (!video_url || typeof video_url !== 'string') {
                return null;
            }

            // Method 1: Direct URL transformation (most reliable)
            // Replace /upload/ with /upload/so_{offset},w_640,h_360,c_fill,q_auto/
            let thumbnail_url = video_url.replace(
                /\/upload\/(v\d+\/)?/,
                `/upload/so_${offset},w_640,h_360,c_fill,q_auto/$1`
            );
            
            // Change file extension to .jpg
            thumbnail_url = thumbnail_url.replace(/\.(mp4|webm|mov|avi|flv|mkv)$/i, '.jpg');
            
            // If URL doesn't have extension, add .jpg
            if (!thumbnail_url.match(/\.(jpg|jpeg|png|gif)$/i)) {
                thumbnail_url += '.jpg';
            }

            return thumbnail_url;
        } catch (error) {
            console.error(`FILE: video_thumbnail.service.js | generate_thumbnail_url | Error:`, error);
            return null;
        }
    }

    /**
     * Update video thumbnail if missing
     * @param {Object} video - Video document
     * @returns {String|null} Thumbnail URL
     */
    ensure_thumbnail(video) {
        try {
            // If thumbnail already exists, return it
            if (video.thumbnail_url) {
                return video.thumbnail_url;
            }

            // Generate thumbnail from video URL
            if (video.video_url) {
                return this.generate_thumbnail_url(video.video_url);
            }

            return null;
        } catch (error) {
            console.error(`FILE: video_thumbnail.service.js | ensure_thumbnail | Error:`, error);
            return null;
        }
    }
}

module.exports = new video_thumbnail_service();
