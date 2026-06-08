import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import proofRoutes from "./routes/proof.routes.js";
import videoRoutes from "./routes/video.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
// Add the final two imports:
import communityRoutes from "./routes/community.routes.js";
import schemeRoutes from "./routes/scheme.routes.js";

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Mount all routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/proofs", proofRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/quiz", quizRoutes);
// Mount the final two routes:
app.use("/api/community", communityRoutes);
app.use("/api/schemes", schemeRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running 🚜" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});