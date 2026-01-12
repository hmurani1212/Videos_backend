/**
 * Comment Routes
 * Routes for comment management
 */

const express = require('express');
const router = express.Router();
const comment_controller = require('../controllers/comment.controller');
const auth_middleware = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/comments
 * @desc    Create new comment
 * @access  Private
 */
router.post('/', auth_middleware.authenticate, comment_controller.create_comment);

/**
 * @route   GET /api/comments/video/:video_id
 * @desc    Get comments by video ID
 * @access  Public
 */
router.get('/video/:video_id', comment_controller.get_comments_by_video);

/**
 * @route   DELETE /api/comments/:comment_id
 * @desc    Delete comment
 * @access  Private (Owner or Admin)
 */
router.delete('/:comment_id', auth_middleware.authenticate, comment_controller.delete_comment);

module.exports = router;

