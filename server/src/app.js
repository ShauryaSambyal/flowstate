import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import aiRoutes from "./routes/ai.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Comma-separated list of browser origins allowed to call this API, e.g.
// CORS_ORIGIN=https://flowstate-two-steel.vercel.app,http://localhost:5173
// Left unset it stays open to every origin (the previous behaviour), so a missing
// variable can never take the deployed API offline for real users.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cheap endpoint used by hosting health checks and by the client's warm-up ping.
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "ok",
        uptime: Math.round(process.uptime())
    });
});

app.use("/ai", aiRoutes);
app.use("/api/v1/users", userRoutes);

app.use((req, res) => {
    console.log(`404: ${req.method} ${req.url}`);
    res.status(404).json({ success: false, message: "API route not found." });
});

export { app };