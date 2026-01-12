const mongoose = require("mongoose");
const { Schema } = mongoose;
const moment = require("moment");

// Use the socail_video database as per MongoDB connection string
const pay_videos_db = mongoose.connection.useDb("socail_video");

const comment_schema = new Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    video_id: {
        type: mongoose.Types.ObjectId,
        ref: "video",
        required: true,
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true,
    },
    comment_text: {
        type: String,
        required: true,
        trim: true,
    },
    is_active: {
        type: Number,
        enum: [0, 1], // 0: Deleted, 1: Active
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
comment_schema.index({ video_id: 1, is_active: 1 });
comment_schema.index({ user_id: 1 });
comment_schema.index({ created_at: -1 });

module.exports = pay_videos_db.model("comment", comment_schema);

