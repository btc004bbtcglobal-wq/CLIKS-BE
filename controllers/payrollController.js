const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');

const payrollController = {
    processPayroll: async (req, res) => {
        const { employee_id, amount, month } = req.body;
        if (!employee_id || !amount) return sendError(res, 'Employee ID and amount are required', 400);
        try {
            const now = new Date().toISOString();
            const result = await db.prepare(
                `INSERT INTO payroll (user_id, employee_id, amount, month, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`
            ).run(req.user.id, employee_id, amount, month || null, 'Processed', now, now);

            return sendSuccess(res, { id: result.lastInsertRowid, status: 'Processed' }, 'Payroll processed successfully', 201);
        } catch (error) {
            console.error('[Payroll Controller] Error processing payroll:', error);
            return sendError(res, 'Failed to process payroll', 500);
        }
    },

    generatePayslip: async (req, res) => {
        const { employee_id, month } = req.body;
        if (!employee_id) return sendError(res, 'Employee ID is required', 400);
        try {
            const employee = await db.prepare('SELECT * FROM employees WHERE id = ? AND user_id = ?').get(employee_id, req.user.id);
            if (!employee) return sendError(res, 'Employee not found', 404);

            return sendSuccess(res, {
                employee_name: employee.name,
                role: employee.role,
                salary: employee.salary,
                month: month || new Date().toLocaleString('en-US', { month: 'long' }),
                generated_at: new Date().toISOString()
            }, 'Payslip generated successfully');
        } catch (error) {
            console.error('[Payroll Controller] Error generating payslip:', error);
            return sendError(res, 'Failed to generate payslip', 500);
        }
    },

    getReports: async (req, res) => {
        try {
            const reports = await db.prepare('SELECT * FROM payroll WHERE user_id = ? ORDER BY month DESC').all(req.user.id);
            return sendSuccess(res, reports, 'Payroll reports fetched successfully');
        } catch (error) {
            console.error('[Payroll Controller] Error fetching payroll reports:', error);
            return sendError(res, 'Failed to fetch payroll reports', 500);
        }
    },

    getEmployeePayrollHistory: async (req, res) => {
        const { id } = req.params;
        try {
            const history = await db.prepare('SELECT * FROM payroll WHERE employee_id = ? AND user_id = ? ORDER BY created_at DESC').all(id, req.user.id);
            return sendSuccess(res, history, 'Employee payroll history fetched successfully');
        } catch (error) {
            console.error('[Payroll Controller] Error fetching history:', error);
            return sendError(res, 'Failed to fetch employee payroll history', 500);
        }
    }
};

module.exports = payrollController;
