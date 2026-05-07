const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');

const paymentController = {
    receivePayment: async (req, res) => {
        const { amount } = req.body;
        if (!amount) return sendError(res, 'Amount is required', 400);
        try {
            const now = new Date().toISOString();
            const result = await db.prepare(
                `INSERT INTO business_payments (user_id, type, amount, status, created_at)
                 VALUES (?, ?, ?, ?, ?)`
            ).run(req.user.id, 'receive', amount, 'Completed', now);

            return sendSuccess(res, { id: result.lastInsertRowid, amount }, 'Payment received successfully', 201);
        } catch (error) {
            console.error('[Payment Controller] Error receiving payment:', error);
            return sendError(res, 'Failed to receive payment', 500);
        }
    },

    paySupplier: async (req, res) => {
        const { supplier_id, amount } = req.body;
        if (!supplier_id || !amount) return sendError(res, 'Supplier ID and amount are required', 400);
        try {
            const now = new Date().toISOString();
            const result = await db.prepare(
                `INSERT INTO business_payments (user_id, type, supplier_id, amount, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).run(req.user.id, 'pay', supplier_id, amount, 'Completed', now);

            return sendSuccess(res, { id: result.lastInsertRowid, amount }, 'Payment to supplier recorded successfully', 201);
        } catch (error) {
            console.error('[Payment Controller] Error paying supplier:', error);
            return sendError(res, 'Failed to process supplier payment', 500);
        }
    },

    getReports: async (req, res) => {
        try {
            const reports = await db.prepare('SELECT * FROM business_payments WHERE user_id = ?').all(req.user.id);
            return sendSuccess(res, reports, 'Payment reports fetched successfully');
        } catch (error) {
            console.error('[Payment Controller] Error fetching reports:', error);
            return sendError(res, 'Failed to fetch payment reports', 500);
        }
    },

    getOutstanding: async (req, res) => {
        try {
            const outstanding = {
                receivables: 154000,
                payables: 87000
            };
            return sendSuccess(res, outstanding, 'Outstanding balances fetched successfully');
        } catch (error) {
            console.error('[Payment Controller] Error getting outstanding balances:', error);
            return sendError(res, 'Failed to fetch outstanding balances', 500);
        }
    }
};

module.exports = paymentController;
