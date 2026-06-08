// src/app.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// ------------------------------
// ROUTE IMPORTS (Notice the .js extensions)
// ------------------------------
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js"; 
import taskRoutes from "./routes/task.routes.js";
import proofRoutes from "./routes/proof.routes.js";
import videoRoutes from "./routes/video.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import communityRoutes from "./routes/community.routes.js";
import schemeRoutes from "./routes/scheme.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ------------------------------
// CONNECT TO MONGODB
// ------------------------------
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// ------------------------------
// MOUNT ROUTES
// ------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/proofs", proofRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/schemes", schemeRoutes);

// ------------------------------
// HEALTH CHECK
// ------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running 🚜" });
});

// ------------------------------
// DEBUG ROUTE
// ------------------------------
app.post("/debug-hello", (req, res) => {
  console.log("Hit /debug-hello route");
  res.json({ message: "Hello from debug route" });
});

// ------------------------------
// START SERVER
// ------------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});