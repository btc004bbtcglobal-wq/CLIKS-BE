const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');

const manufacturingController = {
    createBom: async (req, res) => {
        const { name, description, items } = req.body;
        if (!name) return sendError(res, 'Name is required', 400);
        try {
            const now = new Date().toISOString();
            const result = await db.prepare(
                `INSERT INTO manufacturing_boms (user_id, name, description, items, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).run(req.user.id, name, description || null, JSON.stringify(items || []), now, now);
            
            return sendSuccess(res, { id: result.lastInsertRowid, name }, 'BOM created successfully', 201);
        } catch (error) {
            console.error('[Manufacturing Controller] Error creating BOM:', error);
            return sendError(res, 'Failed to create BOM', 500);
        }
    },

    createOrder: async (req, res) => {
        const { bom_id, product_name, quantity } = req.body;
        if (!product_name) return sendError(res, 'Product name is required', 400);
        try {
            const now = new Date().toISOString();
            const result = await db.prepare(
                `INSERT INTO manufacturing_orders (user_id, bom_id, product_name, quantity, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`
            ).run(req.user.id, bom_id || null, product_name, quantity || 1, 'Pending', now, now);

            return sendSuccess(res, { id: result.lastInsertRowid, product_name, status: 'Pending' }, 'Order created successfully', 201);
        } catch (error) {
            console.error('[Manufacturing Controller] Error creating order:', error);
            return sendError(res, 'Failed to create order', 500);
        }
    },

    completeProduction: async (req, res) => {
        const { order_id } = req.body;
        if (!order_id) return sendError(res, 'Order ID is required', 400);
        try {
            const now = new Date().toISOString();
            await db.prepare(
                `UPDATE manufacturing_orders SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?`
            ).run('Completed', now, order_id, req.user.id);

            return sendSuccess(res, null, 'Production completed successfully');
        } catch (error) {
            console.error('[Manufacturing Controller] Error completing production:', error);
            return sendError(res, 'Failed to complete production', 500);
        }
    },

    getReports: async (req, res) => {
        try {
            const orders = await db.prepare('SELECT * FROM manufacturing_orders WHERE user_id = ?').all(req.user.id);
            const boms = await db.prepare('SELECT * FROM manufacturing_boms WHERE user_id = ?').all(req.user.id);
            return sendSuccess(res, { orders, boms }, 'Manufacturing reports fetched successfully');
        } catch (error) {
            console.error('[Manufacturing Controller] Error getting reports:', error);
            return sendError(res, 'Failed to fetch reports', 500);
        }
    }
};

module.exports = manufacturingController;
