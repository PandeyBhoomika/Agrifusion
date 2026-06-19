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

// ─── Development mode ─────────────────────────────────
console.log("⚠️ Running without env validation");

// ─── Express app ──────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json());

// ─── MongoDB ──────────────────────────────────────────
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });
} else {
  console.log("⚠️ MongoDB disabled for development");
}

// ─── Routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/proofs", proofRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/schemes", schemeRoutes);

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

// ─── Debug route ──────────────────────────────────────
app.post("/debug-hello", (req, res) => {
  console.log("Hit /debug-hello route");
  res.json({
    message: "Hello from debug route"
  });
});

// ─── Start server ─────────────────────────────────────
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});