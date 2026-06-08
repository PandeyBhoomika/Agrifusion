const express = require('express');
const { getTasks, createTask } = require('../controllers/task.controller');
// const { protect } = require('../middleware/auth'); // Uncomment if you want tasks protected by login

const router = express.Router();

router.route('/')
    .get(getTasks)
    .post(createTask); // In a real app, this POST should be protected for Admins only

module.exports = router;