const mongoose = require("mongoose");
const { Schema } = mongoose;
const moment = require("moment");

// Use the socail_video database as per MongoDB connection string
const pay_videos_db = mongoose.connection.useDb("socail_video");

const payment_schema = new Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    payment_method: {
        type: String,
        default: 'qr_code',
    },
    transaction_id: {
        type: String,
        default: null,
    },
    qr_code_url: {
        type: String,
        default: null,
    },
    created_at: {
        type: Number,
        default: () => moment().unix(),
    },
    completed_at: {
        type: Number,
        default: null,
    }
});

// Add indexes for faster lookups
payment_schema.index({ user_id: 1, payment_status: 1 });
payment_schema.index({ transaction_id: 1 });
payment_schema.index({ created_at: -1 });

module.exports = pay_videos_db.model("payment", payment_schema);
