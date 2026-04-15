const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

router.get('/', async (req, res) => {
  const { category, location, page, limit, sort = 'created_at', order = 'desc', search } = req.query;
  let query = 'SELECT * FROM stock WHERE user_id = ?';
  const params = [req.user.id];

  if (category) { query += ' AND category LIKE ?'; params.push(`%${category}%`); }
  if (location) { query += ' AND location LIKE ?'; params.push(`%${location}%`); }
  if (search) { query += ' AND (name LIKE ? OR sku LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const allowedSorts = ['created_at', 'updated_at', 'name', 'quantity', 'unit_price'];
  const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';
  const sortDir = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  query += ` ORDER BY ${sortCol} ${sortDir}`;

  const result = await paginate(query, params, page, limit, db);
  return sendSuccess(res, result.rows, 'Stock fetched', 200, result.meta);
});

router.post('/', async (req, res) => {
  const { name, sku, quantity = 0, unit_price, category, location, notes } = req.body;
  if (!name) return sendError(res, 'Name is required', 400, 'BAD_REQUEST');

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO stock (user_id, name, sku, quantity, unit_price, category, location, notes, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = await stmt.run(req.user.id, name, sku || null, quantity, unit_price || null, category || null, location || null, notes || null, now, now);
  
  const newItem = await db.prepare('SELECT * FROM stock WHERE id = ?').get(info.lastInsertRowid);
  return sendSuccess(res, newItem, 'Stock item created', 201);
});

router.get('/:id', async (req, res) => {
  const item = await db.prepare('SELECT * FROM stock WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return sendError(res, 'Stock item not found', 404, 'NOT_FOUND');
  return sendSuccess(res, item);
});

router.patch('/:id', async (req, res) => {
  const item = await db.prepare('SELECT * FROM stock WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return sendError(res, 'Stock item not found', 404, 'NOT_FOUND');

  const updates = [];
  const params = [];
  const allowedFields = ['name', 'sku', 'quantity', 'unit_price', 'category', 'location', 'notes'];
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (updates.length > 0) {
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(req.params.id, req.user.id);
    await db.prepare(`UPDATE stock SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);
  }
  
  const updatedItem = await db.prepare('SELECT * FROM stock WHERE id = ?').get(req.params.id);
  return sendSuccess(res, updatedItem, 'Stock item updated');
});

router.patch('/:id/adjust-quantity', async (req, res) => {
  const { delta } = req.body;
  if (delta === undefined) return sendError(res, 'Delta is required', 400, 'BAD_REQUEST');

  const item = await db.prepare('SELECT * FROM stock WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return sendError(res, 'Stock item not found', 404, 'NOT_FOUND');

  let newQuantity = item.quantity + Number(delta);
  if (newQuantity < 0) newQuantity = 0;

  const now = new Date().toISOString();
  db.prepare(`UPDATE stock SET quantity = ?, updated_at = ? WHERE id = ? AND user_id = ?`)
    .run(newQuantity, now, req.params.id, req.user.id);

  const updatedItem = await db.prepare('SELECT * FROM stock WHERE id = ?').get(req.params.id);
  return sendSuccess(res, updatedItem, 'Quantity adjusted');
});

router.delete('/:id', async (req, res) => {
  const item = await db.prepare('SELECT * FROM stock WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return sendError(res, 'Stock item not found', 404, 'NOT_FOUND');

  await db.prepare('DELETE FROM stock WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  return res.status(204).end();
});

module.exports = router;
