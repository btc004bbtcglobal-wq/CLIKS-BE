const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { auth, allowRoles } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');
const { invalidatePublicFeed } = require('../utils/cacheInvalidation');

// Apply auth and admin-only role checking to all routes within this file
router.use(auth);
router.use(allowRoles('admin'));

// ── GET /users — List all users ──────────────────────────────────────────
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const users = await db.prepare(
    'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);

  return sendSuccess(res, users, 'Users fetched successfully', 200);
});

// ── DELETE /users/:id — Delete user ──────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  if (userId == req.user.id) {
    return sendError(res, 'Cannot delete yourself', 400, 'BAD_REQUEST');
  }

  const user = await db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return sendError(res, 'User not found', 404, 'NOT_FOUND');

  // Deleting user logic (cascade not setup in sqlite directly on old tables, but we'll delete the user record as MVP)
  await db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  await db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
  
  return res.status(204).end();
});

// ── DELETE /public/:id — Manage (Delete) public posts ────────────────────
router.delete('/public/:id', async (req, res) => {
  const post = await db.prepare('SELECT id FROM public_posts WHERE id = ?').get(req.params.id);
  if (!post) return sendError(res, 'Post not found', 404, 'NOT_FOUND');

  await db.prepare('DELETE FROM public_posts WHERE id = ?').run(req.params.id);
  await invalidatePublicFeed();
  
  return res.status(204).end();
});

// ── PATCH /users/:id/role — Change user role ─────────────────────────────
router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) {
    return sendError(res, 'Invalid role', 400, 'BAD_REQUEST');
  }

  const user = await db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return sendError(res, 'User not found', 404, 'NOT_FOUND');

  await db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  
  return sendSuccess(res, null, 'User role updated successfully');
});

module.exports = router;
