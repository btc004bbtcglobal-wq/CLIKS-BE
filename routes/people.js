const express = require('express');
const router = express.Router();
const { getAllTransactions, getAllReminders, getAllRecords, getPeople, createPerson, getPerson, updatePerson, deletePerson } = require('../controllers/peopleController');
const asyncHandler = require('../utils/asyncHandler');

// ── Global aggregated views (must be declared before /:id) ────────────────────

// GET /people/transactions  — List all people transactions across all contacts
router.get('/transactions', asyncHandler(getAllTransactions));

// GET /people/reminders     — List all people reminders across all contacts (with overdue stats)
router.get('/reminders', asyncHandler(getAllReminders));

// GET /people/records       — List all people records across all contacts
router.get('/records', asyncHandler(getAllRecords));

// ── People CRUD ───────────────────────────────────────────────────────────────

// GET    /people              — List all people (with aggregated lent/borrowed/net balance)
router.get('/', asyncHandler(getPeople));

// POST   /people              — Create a new person/contact
router.post('/', asyncHandler(createPerson));

// GET    /people/:id          — Get a single person by ID
router.get('/:id', asyncHandler(getPerson));

// PATCH  /people/:id          — Update person fields
router.patch('/:id', asyncHandler(updatePerson));

// DELETE /people/:id          — Delete a person and all their transactions, reminders, and records
router.delete('/:id', asyncHandler(deletePerson));

module.exports = router;
