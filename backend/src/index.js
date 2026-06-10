import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import proofRoutes from "./routes/proof.routes.js";
import videoRoutes from "./routes/video.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import communityRoutes from "./routes/community.routes.js";
import schemeRoutes from "./routes/scheme.routes.js";

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);      // ← farm profile lives here
app.use("/api/tasks", taskRoutes);
app.use("/api/proofs", proofRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/schemes", schemeRoutes);

app.get("/api/states", (req, res) => {
  res.json([
    { id: "1", name: "Maharashtra" },
    { id: "2", name: "Punjab" },
    { id: "3", name: "Uttar Pradesh" },
    { id: "4", name: "Gujarat" },
    { id: "5", name: "Madhya Pradesh" },
    { id: "6", name: "Haryana" },
  ]);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running 🚜" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
