import mongoose, { Schema } from "mongoose";

const starClaimSchema = new Schema({
    amount: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    photoHash: {
        type: String,
        default: null,
    },
    at: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    chatHistory: {
        type: Array,
        default: [],
    },
    stars: {
        type: Number,
        default: 0,
        min: 0,
    },
    badge: {
        type: String,
        default: null,
    },
    lastStarClaimAt: {
        type: Date,
        default: null,
    },
    starsMigratedAt: {
        type: Date,
        default: null,
    },
    claimedChallenges: {
        type: [String],
        default: [],
        index: true,
    },
    starsHistory: {
        type: [starClaimSchema],
        default: [],
    },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);