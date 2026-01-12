const mongoose = require("mongoose");
const { Schema } = mongoose;
const moment = require("moment");

// Use the socail_video database as per MongoDB connection string
const pay_videos_db = mongoose.connection.useDb("socail_video");

const video_view_schema = new Schema({
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
    viewed_at: {
        type: Number,
        default: () => moment().unix(),
    }
});

// Add compound index to ensure one view per user per video
video_view_schema.index({ video_id: 1, user_id: 1 }, { unique: true });
video_view_schema.index({ viewed_at: -1 });

module.exports = pay_videos_db.model("video_view", video_view_schema);

