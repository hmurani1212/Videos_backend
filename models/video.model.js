const mongoose = require("mongoose");
const { Schema } = mongoose;
const moment = require("moment");

// Use the socail_video database as per MongoDB connection string
const pay_videos_db = mongoose.connection.useDb("socail_video");

const video_schema = new Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    video_name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
    },
    video_url: {
        type: String,
        required: true,
    },
    cloudinary_public_id: {
        type: String,
        required: true,
    },
    thumbnail_url: {
        type: String,
        default: null,
    },
    duration: {
        type: Number, // Duration in seconds
        default: 0,
    },
    uploaded_by: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true,
    },
    view_count: {
        type: Number,
        default: 0,
    },
    is_active: {
        type: Number,
        enum: [0, 1], // 0: Inactive, 1: Active
        default: 1,
    },
    created_at: {
        type: Number,
        default: () => moment().unix(),
    },
    updated_at: {
        type: Number,
        default: () => moment().unix(),
    }
});

// Add indexes for faster lookups
video_schema.index({ country: 1, is_active: 1 });
video_schema.index({ video_name: 'text', description: 'text' }); // Text search index
video_schema.index({ created_at: -1 });
video_schema.index({ view_count: -1 });

module.exports = pay_videos_db.model("video", video_schema);

