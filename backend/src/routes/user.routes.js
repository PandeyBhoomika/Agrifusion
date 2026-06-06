// src/routes/user.routes.js

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const userController = require("../controllers/user.controller");

// Save/update profile
router.post("/profile", auth, userController.updateProfile);

// Get profile
router.get("/profile", auth, userController.getProfile);

module.exports = router;
