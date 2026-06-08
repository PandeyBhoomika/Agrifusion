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

// ─── Env validation (fail fast with a clear message) ──
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  console.error("   Create a backend/.env file. See .env.example for reference.");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

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

// ─── Health check ─────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running 🚜" });
});

// ─── Debug route ──────────────────────────────────────
app.post("/debug-hello", (req, res) => {
  console.log("Hit /debug-hello route");
  res.json({ message: "Hello from debug route" });
});

// ─── Start server ─────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});