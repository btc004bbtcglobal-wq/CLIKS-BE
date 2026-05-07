const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');

const returnController = {
    createReturn: async (req, res) => {
        const { product_name, amount } = req.body;
        if (!product_name) return sendError(res, 'Product name is required', 400);
        try {
            const now = new Date().toISOString();
            const result = await db.prepare(
                `INSERT INTO product_returns (user_id, product_name, amount, status, created_at)
                 VALUES (?, ?, ?, ?, ?)`
            ).run(req.user.id, product_name, amount || 0, 'Pending', now);

            return sendSuccess(res, { id: result.lastInsertRowid, product_name, status: 'Pending' }, 'Return recorded successfully', 201);
        } catch (error) {
            console.error('[Return Controller] Error creating return:', error);
            return sendError(res, 'Failed to create return record', 500);
        }
    },

    approveReturn: async (req, res) => {
        const { id } = req.params;
        try {
            await db.prepare(
                `UPDATE product_returns SET status = ? WHERE id = ? AND user_id = ?`
            ).run('Approved', id, req.user.id);

            return sendSuccess(res, null, 'Return approved successfully');
        } catch (error) {
            console.error('[Return Controller] Error approving return:', error);
            return sendError(res, 'Failed to approve return', 500);
        }
    },

    processRefund: async (req, res) => {
        const { id } = req.params;
        try {
            await db.prepare(
                `UPDATE product_returns SET status = ? WHERE id = ? AND user_id = ?`
            ).run('Refunded', id, req.user.id);

            return sendSuccess(res, null, 'Refund processed successfully');
        } catch (error) {
            console.error('[Return Controller] Error processing refund:', error);
            return sendError(res, 'Failed to process refund', 500);
        }
    },

    getReports: async (req, res) => {
        try {
            const returns = await db.prepare('SELECT * FROM product_returns WHERE user_id = ?').all(req.user.id);
            return sendSuccess(res, returns, 'Return reports fetched successfully');
        } catch (error) {
            console.error('[Return Controller] Error fetching reports:', error);
            return sendError(res, 'Failed to fetch return reports', 500);
        }
    }
};

module.exports = returnController;
