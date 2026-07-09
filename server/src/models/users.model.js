import mongoose, { Schema } from "mongoose";

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
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
