// src/app.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

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
// ROUTES
// ------------------------------
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

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
  console.log("Server running on port", PORT);
});
