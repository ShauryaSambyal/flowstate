import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import aiRoutes from "./routes/ai.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/ai", aiRoutes);
app.use("/api/v1/users", userRoutes);

app.use((req, res) => {
    console.log(`404: ${req.method} ${req.url}`);
    res.status(404).json({ success: false, message: "API route not found." });
});

export { app };