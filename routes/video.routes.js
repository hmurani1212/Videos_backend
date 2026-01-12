/**
 * Video Routes
 * Routes for video management
 */

const express = require('express');
const router = express.Router();
const video_controller = require('../controllers/video.controller');
const auth_middleware = require('../middlewares/auth.middleware');
const upload_middleware = require('../middlewares/upload.middleware');

/**
 * @route   POST /api/videos
 * @desc    Create new video (Admin only)
 * @access  Private (Admin)
 */
router.post(
    '/',
    auth_middleware.authenticate,
    auth_middleware.verify_admin,
    upload_middleware.upload_video,
    video_controller.create_video
);

/**
 * @route   GET /api/videos
 * @desc    Get all videos with optional country filter
 * @access  Public
 */
router.get('/', video_controller.get_videos);

/**
 * @route   GET /api/videos/search
 * @desc    Search videos by name or description
 * @access  Public
 */
router.get('/search', video_controller.search_videos);

/**
 * @route   GET /api/videos/countries
 * @desc    Get all available countries
 * @access  Public
 */
router.get('/countries', video_controller.get_countries);

/**
 * @route   GET /api/videos/country/:country
 * @desc    Get videos by country
 * @access  Public
 */
router.get('/country/:country', video_controller.get_videos_by_country);

/**
 * @route   GET /api/videos/:video_id
 * @desc    Get video by ID
 * @access  Public (with optional authentication for view tracking)
 */
router.get(
    '/:video_id',
    auth_middleware.authenticate_optional,
    video_controller.get_video_by_id
);

/**
 * @route   PUT /api/videos/:video_id
 * @desc    Update video (Admin only)
 * @access  Private (Admin)
 */
router.put(
    '/:video_id',
    auth_middleware.authenticate,
    auth_middleware.verify_admin,
    video_controller.update_video
);

/**
 * @route   DELETE /api/videos/:video_id
 * @desc    Delete video (Admin only)
 * @access  Private (Admin)
 */
router.delete(
    '/:video_id',
    auth_middleware.authenticate,
    auth_middleware.verify_admin,
    video_controller.delete_video
);

/**
 * @route   POST /api/videos/:video_id/view
 * @desc    Record video view
 * @access  Private
 */
router.post(
    '/:video_id/view',
    auth_middleware.authenticate,
    video_controller.record_view
);

module.exports = router;

