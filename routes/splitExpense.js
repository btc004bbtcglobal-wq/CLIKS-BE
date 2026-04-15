const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

// ── GET /summary ─────────────────────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  const participants = db.prepare(`
    SELECT 
      name,
      SUM(CASE WHEN is_settled = 0 THEN share_amount ELSE 0 END) as total_owed,
      COUNT(*) as split_count
    FROM split_participants
    WHERE user_id = ?
    GROUP BY name
  `).all(req.user.id);

  // We also need to know if "you_owe" or "owes_you".
  // In the current schema, split_participants is ALWAYS people who owe YOU?
  // Let's check handleAddSplit in the frontend.
  // frontend: isOwedToYou ? 'owes_you' : 'you_owe'
  // But the backend POST / expects participants and their share_amount.
  // It doesn't seem to differentiate who paid. 
  // Wait, if I pay $100 and split with Sarah, she owes me $50.
  // If Sarah pays $100 and splits with me, I owe her $50.
  
  // The split_expenses table doesn't have a "paid_by" column?
  // Let's check split_expenses table again.
  // CREATE TABLE split_expenses (id, user_id, title, total_amount, date, notes)
  // It doesn't say who paid. 
  // This implies the user (req.user.id) is always the one who paid?
  // If so, all split_participants owe the user.
  
  return sendSuccess(res, participants, 'Split summary fetched');
});

// ── PATCH /settle-friend ─────────────────────────────────────────────────────
router.patch('/settle-friend', async (req, res) => {
  const { name } = req.body;
  if (!name) return sendError(res, 'name is required', 400, 'BAD_REQUEST');

  db.prepare(`
    UPDATE split_participants 
    SET is_settled = 1, updated_at = ? 
    WHERE user_id = ? AND name = ? AND is_settled = 0
  `).run(new Date().toISOString(), req.user.id, name);

  return sendSuccess(res, { name }, 'Friend settled');
});

// ── GET / ─────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { page, limit, sort = 'created_at', order = 'desc', search, from, to } = req.query;
  let query = 'SELECT * FROM split_expenses WHERE user_id = ?';
  const params = [req.user.id];

  if (search) { query += ' AND title LIKE ?'; params.push(`%${search}%`); }
  if (from)   { query += ' AND date >= ?'; params.push(from); }
  if (to)     { query += ' AND date <= ?'; params.push(to); }

  const allowedSorts = ['created_at', 'updated_at', 'title', 'total_amount', 'date'];
  const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';
  const sortDir = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortCol} ${sortDir}`;

  const result = await paginate(query, params, page, limit, db);
  return sendSuccess(res, result.rows, 'Split expenses fetched', 200, result.meta);
});

// ── POST / ────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { title, total_amount, date, notes, participants = [] } = req.body;
  if (!title || total_amount === undefined || !date) {
    return sendError(res, 'title, total_amount, and date are required', 400, 'BAD_REQUEST');
  }

  // Validate participant shares sum
  if (participants.length > 0) {
    const sum = participants.reduce((acc, p) => acc + (parseFloat(p.share_amount) || 0), 0);
    if (Math.abs(sum - parseFloat(total_amount)) > 0.01) {
      return sendError(
        res,
        `Participant shares (${sum.toFixed(2)}) must equal total_amount (${parseFloat(total_amount).toFixed(2)})`,
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  const now = new Date().toISOString();
  const create = await db.transaction(async () => {
    const stmt = db.prepare(`
      INSERT INTO split_expenses (user_id, title, total_amount, date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = await stmt.run(req.user.id, title, total_amount, date, notes || null, now, now);
    const splitId = info.lastInsertRowid;

    if (participants.length > 0) {
      const pStmt = db.prepare(`
        INSERT INTO split_participants (split_expense_id, user_id, name, share_amount, is_settled, created_at, updated_at)
        VALUES (?, ?, ?, ?, 0, ?, ?)
      `);
      for (const p of participants) {
        pStmt.run(splitId, req.user.id, p.name, p.share_amount, now, now);
      }
    }

    return splitId;
  });

  const splitId = await create();
  const newSplit = await db.prepare('SELECT * FROM split_expenses WHERE id = ?').get(splitId);
  newSplit.participants = await db.prepare('SELECT * FROM split_participants WHERE split_expense_id = ?').all(splitId);

  return sendSuccess(res, newSplit, 'Split expense created', 201);
});

// ── GET /:id ──────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const split = await db.prepare('SELECT * FROM split_expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!split) return sendError(res, 'Split expense not found', 404, 'NOT_FOUND');

  split.participants = db.prepare(
    'SELECT * FROM split_participants WHERE split_expense_id = ? AND user_id = ?'
  ).all(req.params.id, req.user.id);

  return sendSuccess(res, split);
});

// ── PATCH /:id ────────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  const split = await db.prepare('SELECT * FROM split_expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!split) return sendError(res, 'Split expense not found', 404, 'NOT_FOUND');

  const updates = [];
  const params = [];
  for (const field of ['title', 'total_amount', 'date', 'notes']) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (updates.length > 0) {
    updates.push('updated_at = ?');
    params.push(new Date().toISOString(), req.params.id, req.user.id);
    await db.prepare(`UPDATE split_expenses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);
  }

  const updated = await db.prepare('SELECT * FROM split_expenses WHERE id = ?').get(req.params.id);
  updated.participants = await db.prepare('SELECT * FROM split_participants WHERE split_expense_id = ?').all(req.params.id);
  return sendSuccess(res, updated, 'Split expense updated');
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const split = await db.prepare('SELECT * FROM split_expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!split) return sendError(res, 'Split expense not found', 404, 'NOT_FOUND');

  db.transaction(async () => {
    await db.prepare('DELETE FROM split_participants WHERE split_expense_id = ? AND user_id = ?').run(req.params.id, req.user.id);
    await db.prepare('DELETE FROM split_expenses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  })();

  return res.status(204).end();
});

// ── GET /:id/participants ─────────────────────────────────────────────────────
router.get('/:id/participants', async (req, res) => {
  const split = await db.prepare('SELECT * FROM split_expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!split) return sendError(res, 'Split expense not found', 404, 'NOT_FOUND');

  const participants = db.prepare(
    'SELECT * FROM split_participants WHERE split_expense_id = ? AND user_id = ? ORDER BY created_at ASC'
  ).all(req.params.id, req.user.id);

  return sendSuccess(res, participants, 'Participants fetched');
});

// ── POST /:id/participants ────────────────────────────────────────────────────
router.post('/:id/participants', async (req, res) => {
  const split = await db.prepare('SELECT * FROM split_expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!split) return sendError(res, 'Split expense not found', 404, 'NOT_FOUND');

  const { name, share_amount } = req.body;
  if (!name || share_amount === undefined) {
    return sendError(res, 'name and share_amount are required', 400, 'BAD_REQUEST');
  }

  const now = new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO split_participants (split_expense_id, user_id, name, share_amount, is_settled, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `).run(req.params.id, req.user.id, name, share_amount, now, now);

  const newParticipant = await db.prepare('SELECT * FROM split_participants WHERE id = ?').get(info.lastInsertRowid);
  return sendSuccess(res, newParticipant, 'Participant added', 201);
});

// ── PATCH /:id/participants/:participantId/settle ─────────────────────────────
router.patch('/:id/participants/:participantId/settle', async (req, res) => {
  const split = await db.prepare('SELECT * FROM split_expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!split) return sendError(res, 'Split expense not found', 404, 'NOT_FOUND');

  const participant = db.prepare(
    'SELECT * FROM split_participants WHERE id = ? AND split_expense_id = ? AND user_id = ?'
  ).get(req.params.participantId, req.params.id, req.user.id);
  if (!participant) return sendError(res, 'Participant not found', 404, 'NOT_FOUND');

  db.prepare(
    'UPDATE split_participants SET is_settled = 1, updated_at = ? WHERE id = ?'
  ).run(new Date().toISOString(), req.params.participantId);

  const updated = await db.prepare('SELECT * FROM split_participants WHERE id = ?').get(req.params.participantId);
  return sendSuccess(res, updated, 'Participant settled');
});

// ── DELETE /:id/participants/:participantId ────────────────────────────────────
router.delete('/:id/participants/:participantId', async (req, res) => {
  const split = await db.prepare('SELECT * FROM split_expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!split) return sendError(res, 'Split expense not found', 404, 'NOT_FOUND');

  const participant = db.prepare(
    'SELECT * FROM split_participants WHERE id = ? AND split_expense_id = ? AND user_id = ?'
  ).get(req.params.participantId, req.params.id, req.user.id);
  if (!participant) return sendError(res, 'Participant not found', 404, 'NOT_FOUND');

  await db.prepare('DELETE FROM split_participants WHERE id = ?').run(req.params.participantId);
  return res.status(204).end();
});

module.exports = router;
