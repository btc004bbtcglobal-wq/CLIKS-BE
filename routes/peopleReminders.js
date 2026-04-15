const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

// Verify person ownership
router.use(async (req, res, next) => {
  const person = await db.prepare('SELECT * FROM people WHERE id = ? AND user_id = ?').get(req.params.personId, req.user.id);
  if (!person) return sendError(res, 'Person not found', 404, 'NOT_FOUND');
  next();
});

router.get('/', async (req, res) => {
  const { page, limit, sort = 'due_date', order = 'asc', search, status } = req.query;
  let query = 'SELECT * FROM people_reminders WHERE person_id = ? AND user_id = ?';
  const params = [req.params.personId, req.user.id];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (search) { query += ' AND (title LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const allowedSorts = ['created_at', 'updated_at', 'title', 'due_date', 'status'];
  const sortCol = allowedSorts.includes(sort) ? sort : 'due_date';
  const sortDir = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  query += ` ORDER BY ${sortCol} ${sortDir}`;

  const result = await paginate(query, params, page, limit, db);
  return sendSuccess(res, result.rows, 'People reminders fetched', 200, result.meta);
});

router.post('/', async (req, res) => {
  const { title, description, due_date, status = 'pending' } = req.body;
  if (!title || !due_date) return sendError(res, 'Title and due_date are required', 400, 'BAD_REQUEST');

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO people_reminders (person_id, user_id, title, description, due_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = await stmt.run(req.params.personId, req.user.id, title, description || null, due_date, status, now, now);

  const newItem = await db.prepare('SELECT * FROM people_reminders WHERE id = ?').get(info.lastInsertRowid);
  return sendSuccess(res, newItem, 'Person reminder created', 201);
});

router.get('/:id', async (req, res) => {
  const item = await db.prepare('SELECT * FROM people_reminders WHERE id = ? AND person_id = ? AND user_id = ?').get(req.params.id, req.params.personId, req.user.id);
  if (!item) return sendError(res, 'Person reminder not found', 404, 'NOT_FOUND');
  return sendSuccess(res, item);
});

router.patch('/:id', async (req, res) => {
  const item = await db.prepare('SELECT * FROM people_reminders WHERE id = ? AND person_id = ? AND user_id = ?').get(req.params.id, req.params.personId, req.user.id);
  if (!item) return sendError(res, 'Person reminder not found', 404, 'NOT_FOUND');

  const updates = [];
  const params = [];
  for (const field of ['title', 'description', 'due_date', 'status']) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (updates.length > 0) {
    updates.push('updated_at = ?');
    params.push(new Date().toISOString(), req.params.id, req.params.personId, req.user.id);
    await db.prepare(`UPDATE people_reminders SET ${updates.join(', ')} WHERE id = ? AND person_id = ? AND user_id = ?`).run(...params);
  }

  const updatedItem = await db.prepare('SELECT * FROM people_reminders WHERE id = ?').get(req.params.id);
  return sendSuccess(res, updatedItem, 'Person reminder updated');
});

router.delete('/:id', async (req, res) => {
  const item = await db.prepare('SELECT * FROM people_reminders WHERE id = ? AND person_id = ? AND user_id = ?').get(req.params.id, req.params.personId, req.user.id);
  if (!item) return sendError(res, 'Person reminder not found', 404, 'NOT_FOUND');

  await db.prepare('DELETE FROM people_reminders WHERE id = ? AND person_id = ? AND user_id = ?').run(req.params.id, req.params.personId, req.user.id);
  return res.status(204).end();
});

module.exports = router;
