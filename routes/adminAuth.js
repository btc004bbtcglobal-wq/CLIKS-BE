const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');
const { adminLogin } = require('../controllers/adminAuthController');

// POST /api/v1/admin/auth/login — Isolated administrative handshake entry point
router.post('/login', authLimiter, asyncHandler(adminLogin));

module.exports = router;
