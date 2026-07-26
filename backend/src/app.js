import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// ─── Route imports ────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import proofRoutes from "./routes/proof.routes.js";
import videoRoutes from "./routes/video.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import communityRoutes from "./routes/community.routes.js";
import schemeRoutes from "./routes/scheme.routes.js";
import storyRoutes from "./routes/story.routes.js";
import activityRoutes from "./routes/activity.routes.js"; // ✅ NEW
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Env validation ────────────────────────────────────
const REQUIRED_ENV_VARS = ["JWT_SECRET", "MONGO_URI", "EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS"];
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingVars.join(", ")}\n` +
    `   Check your backend/.env file before starting the server.`
  );
  process.exit(1);
}

console.log("✅ Environment variables validated");

// ─── Express app ──────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ─── MongoDB ──────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ─── Routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/proofs", proofRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/activity", activityRoutes); // ✅ NEW

// ─── States API ───────────────────────────────────────
app.get("/api/states", (req, res) => {
  const indianStates = [
    { id: "1", name: "Maharashtra" },
    { id: "2", name: "Punjab" },
    { id: "3", name: "Uttar Pradesh" },
    { id: "4", name: "Gujarat" },
    { id: "5", name: "Madhya Pradesh" },
    { id: "6", name: "Haryana" }
  ];

  res.json(indianStates);
});

// ─── Health check ─────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend running 🚜"
  });
});

// ─── Start server ─────────────────────────────────────
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});