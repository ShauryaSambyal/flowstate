import { User } from "../models/users.model.js";

/* Progress persistence for the Workflow Gallery. Signed-in users can resume
   an active workflow on any device; guests simply never call these routes and
   keep everything in localStorage. */

const MAX_WORKFLOWS_PER_USER = 25;
const MAX_STEPS = 12;
const MAX_TASKS_PER_STEP = 10;
const ALLOWED_STATUS = ["draft", "active", "complete"];

function shortString(value, max) {
    if (typeof value !== "string") return "";
    return value.trim().slice(0, max);
}

function stringList(value, maxItems, maxLength) {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item) => typeof item === "string")
        .map((item) => item.slice(0, maxLength))
        .slice(0, maxItems);
}

function sanitizeStep(step, index) {
    if (!step || typeof step !== "object") return null;
    const title = shortString(step.title, 120);
    if (!title) return null;

    return {
        id: shortString(step.id, 60) || `step-${index + 1}`,
        order: Number.isFinite(step.order) ? step.order : index + 1,
        phase: shortString(step.phase, 20) || "plan",
        title,
        summary: shortString(step.summary, 400),
        details: stringList(step.details, 6, 300),
        tasks: (Array.isArray(step.tasks) ? step.tasks : [])
            .map((task, taskIndex) => {
                if (!task || typeof task !== "object") return null;
                const label = shortString(task.label, 240);
                if (!label) return null;
                return { id: shortString(task.id, 80) || `${index + 1}.${taskIndex + 1}`, label };
            })
            .filter(Boolean)
            .slice(0, MAX_TASKS_PER_STEP),
        resources: (Array.isArray(step.resources) ? step.resources : [])
            .map((resource) => {
                if (!resource || typeof resource !== "object") return null;
                const label = shortString(resource.label, 120);
                if (!label) return null;
                return { label, note: shortString(resource.note, 200) };
            })
            .filter(Boolean)
            .slice(0, 4),
    };
}

function sanitizeWorkflow(input) {
    if (!input || typeof input !== "object") return null;

    const id = shortString(input.id, 80);
    const workflowId = shortString(input.workflowId, 60);
    if (!id || !workflowId) return null;

    const steps = (Array.isArray(input.steps) ? input.steps : [])
        .map(sanitizeStep)
        .filter(Boolean)
        .slice(0, MAX_STEPS);

    const completedTaskIds = stringList(input.completedTaskIds, 200, 80);
    const totalTasks = steps.reduce((sum, step) => sum + step.tasks.length, 0);
    const status = ALLOWED_STATUS.includes(input.status) ? input.status : "draft";

    return {
        id,
        workflowId,
        category: shortString(input.category, 60),
        intent: shortString(input.intent, 300),
        subject: shortString(input.subject, 160),
        focusAreas: stringList(input.focusAreas, 8, 80),
        answers: input.answers && typeof input.answers === "object" ? input.answers : {},
        steps,
        completedTaskIds: completedTaskIds.filter((taskId) =>
            steps.some((step) => step.tasks.some((task) => task.id === taskId))
        ),
        totalTasks,
        status,
        source: shortString(input.source, 20) || "builtin",
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
        updatedAt: new Date(),
    };
}

export const getWorkflows = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            workflows: user.workflows || [],
        });
    } catch (error) {
        console.error("Get Workflows Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching workflows.",
            error: error.message,
        });
    }
};

export const saveWorkflow = async (req, res) => {
    try {
        const { email, workflow } = req.body;

        if (!email) {
            return res.status(401).json({ success: false, message: "Sign in to save your workflow" });
        }

        const clean = sanitizeWorkflow(workflow);
        if (!clean) {
            return res.status(400).json({ success: false, message: "A workflow with an id is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const existing = (user.workflows || []).find((item) => item.id === clean.id);
        if (existing) {
            existing.set(clean);
        } else {
            user.workflows.push(clean);
        }

        // Keep the newest runs only, so a long-lived account cannot grow forever.
        user.workflows = (user.workflows || [])
            .slice()
            .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
            .slice(0, MAX_WORKFLOWS_PER_USER);

        await user.save();

        const saved = user.workflows.find((item) => item.id === clean.id) || clean;

        res.status(200).json({
            success: true,
            workflow: saved,
        });
    } catch (error) {
        console.error("Save Workflow Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while saving the workflow.",
            error: error.message,
        });
    }
};

export const deleteWorkflow = async (req, res) => {
    try {
        const { email } = req.query;
        const { workflowId } = req.params;

        if (!email) {
            return res.status(401).json({ success: false, message: "Sign in to manage your workflows" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.workflows = (user.workflows || []).filter((item) => item.id !== workflowId);
        await user.save();

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Delete Workflow Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while deleting the workflow.",
            error: error.message,
        });
    }
};
