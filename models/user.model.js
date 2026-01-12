const mongoose = require("mongoose");
const { Schema } = mongoose;
const moment = require("moment");

// Use the socail_video database as per MongoDB connection string
const pay_videos_db = mongoose.connection.useDb("socail_video");

const user_schema = new Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        default: null,
    },
    age: {
        type: Number,
        default: null,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
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

// Add index for faster lookups
user_schema.index({ email: 1 }, { unique: true });
user_schema.index({ role: 1 });

module.exports = pay_videos_db.model("user", user_schema);

