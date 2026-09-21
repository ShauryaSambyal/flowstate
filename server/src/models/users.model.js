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

/* Workflow Gallery runs — one document per generated workflow, so a signed-in
   user can resume an active plan on any device. */
const workflowTaskSchema = new Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
}, { _id: false });

const workflowResourceSchema = new Schema({
    label: { type: String, required: true },
    note: { type: String, default: "" },
}, { _id: false });

const workflowStepSchema = new Schema({
    id: { type: String, required: true },
    order: { type: Number, default: 0 },
    phase: { type: String, default: "plan" },
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    details: { type: [String], default: [] },
    tasks: { type: [workflowTaskSchema], default: [] },
    resources: { type: [workflowResourceSchema], default: [] },
}, { _id: false });

const workflowSchema = new Schema({
    id: { type: String, required: true },
    workflowId: { type: String, required: true },
    category: { type: String, default: "" },
    intent: { type: String, default: "" },
    subject: { type: String, default: "" },
    focusAreas: { type: [String], default: [] },
    answers: { type: Schema.Types.Mixed, default: {} },
    steps: { type: [workflowStepSchema], default: [] },
    completedTaskIds: { type: [String], default: [] },
    totalTasks: { type: Number, default: 0 },
    status: { type: String, default: "draft" },
    source: { type: String, default: "builtin" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
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
    workflows: {
        type: [workflowSchema],
        default: [],
    },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);