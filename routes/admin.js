const express = require('express');
const router = express.Router();
const { auth, allowRoles } = require('../middleware/auth');
const { 
  getUsers, 
  deleteUser, 
  deletePublicPost, 
  updateUserRole,
  getSystemStats,
  getPublicPosts,
  getAuditLogs
} = require('../controllers/adminController');

// Apply auth and admin-only role checking to all routes within this file
router.use(auth);
router.use(allowRoles('admin'));

// GET    /admin/users              — List all registered users
router.get('/users', getUsers);

// DELETE /admin/users/:id          — Delete a user by ID
router.delete('/users/:id', deleteUser);

// DELETE /admin/public/:id         — Admin-delete a public post
router.delete('/public/:id', deletePublicPost);

// GET    /admin/public             — Get all public posts for moderation
router.get('/public', getPublicPosts);

// PATCH  /admin/users/:id/role     — Change a user's role (admin/user)
router.patch('/users/:id/role', updateUserRole);

// GET    /admin/stats              — Synthesise global system statistics
router.get('/stats', getSystemStats);

// GET    /admin/logs               — Synthesise platform activity & audit logs
router.get('/logs', getAuditLogs);

module.exports = router;

