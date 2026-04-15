const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');

// Verify plan ownership
router.use(async (req, res, next) => {
  const plan = await db.prepare('SELECT * FROM financial_plans WHERE id = ? AND user_id = ?').get(req.params.planId, req.user.id);
  if (!plan) return sendError(res, 'Financial plan not found', 404, 'NOT_FOUND');
  next();
});

router.get('/', async (req, res) => {
  const pId = req.params.planId;
  const uId = req.user.id;

  // Aggregate expected income
  const expectedIncomeRow = await db.prepare('SELECT SUM(expected_amount) as total FROM plan_income WHERE plan_id = ? AND user_id = ?').get(pId, uId);
  const total_expected_income = expectedIncomeRow.total || 0;

  // Aggregate actual income
  const actualIncomeRow = await db.prepare('SELECT SUM(actual_amount) as total FROM plan_income WHERE plan_id = ? AND user_id = ?').get(pId, uId);
  const total_actual_income = actualIncomeRow.total || 0;

  // Aggregate allocated budget
  const allocatedBudgetRow = await db.prepare('SELECT SUM(allocated_amount) as total FROM plan_budgets WHERE plan_id = ? AND user_id = ?').get(pId, uId);
  const total_allocated_budget = allocatedBudgetRow.total || 0;

  // Aggregate spent budget
  const spentBudgetRow = await db.prepare('SELECT SUM(spent_amount) as total FROM plan_budgets WHERE plan_id = ? AND user_id = ?').get(pId, uId);
  const total_spent_budget = spentBudgetRow.total || 0;

  // Aggregate expected expenses
  const expectedExpensesRow = await db.prepare('SELECT SUM(expected_amount) as total FROM plan_expenses WHERE plan_id = ? AND user_id = ?').get(pId, uId);
  const total_expected_expenses = expectedExpensesRow.total || 0;

  // Aggregate actual expenses
  const actualExpensesRow = await db.prepare('SELECT SUM(actual_amount) as total FROM plan_expenses WHERE plan_id = ? AND user_id = ?').get(pId, uId);
  const total_actual_expenses = actualExpensesRow.total || 0;

  return sendSuccess(res, {
    total_expected_income,
    total_actual_income,
    total_allocated_budget,
    total_spent_budget,
    total_expected_expenses,
    total_actual_expenses
  }, 'Plan analysis fetched');
});

module.exports = router;
