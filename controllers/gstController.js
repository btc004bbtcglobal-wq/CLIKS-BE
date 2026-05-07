const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');

const gstController = {
    generateInvoice: async (req, res) => {
        const { invoice_number, client_name, amount, gst_amount } = req.body;
        if (!invoice_number || !client_name) return sendError(res, 'Invoice number and client name are required', 400);
        try {
            const now = new Date().toISOString();
            const result = await db.prepare(
                `INSERT INTO gst_invoices (user_id, invoice_number, client_name, amount, gst_amount, created_at)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).run(req.user.id, invoice_number, client_name, amount || 0, gst_amount || 0, now);

            return sendSuccess(res, { id: result.lastInsertRowid, invoice_number }, 'GST Invoice generated successfully', 201);
        } catch (error) {
            console.error('[GST Controller] Error generating invoice:', error);
            return sendError(res, 'Failed to generate GST invoice', 500);
        }
    },

    generateEwayBill: async (req, res) => {
        const { invoice_id } = req.body;
        if (!invoice_id) return sendError(res, 'Invoice ID is required', 400);
        try {
            const ewayBillNumber = 'EWAY-' + Math.floor(100000 + Math.random() * 900000);
            await db.prepare(
                `UPDATE gst_invoices SET eway_bill_number = ? WHERE id = ? AND user_id = ?`
            ).run(ewayBillNumber, invoice_id, req.user.id);

            return sendSuccess(res, { eway_bill_number: ewayBillNumber }, 'e-Way Bill generated successfully');
        } catch (error) {
            console.error('[GST Controller] Error generating e-Way bill:', error);
            return sendError(res, 'Failed to generate e-Way bill', 500);
        }
    },

    getSummary: async (req, res) => {
        try {
            const invoices = await db.prepare('SELECT * FROM gst_invoices WHERE user_id = ?').all(req.user.id);
            const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
            const totalGst = invoices.reduce((sum, inv) => sum + (inv.gst_amount || 0), 0);

            return sendSuccess(res, {
                total_invoices: invoices.length,
                total_amount: totalAmount,
                total_gst: totalGst,
                invoices
            }, 'GST summary fetched successfully');
        } catch (error) {
            console.error('[GST Controller] Error fetching summary:', error);
            return sendError(res, 'Failed to fetch GST summary', 500);
        }
    },

    getReturns: async (req, res) => {
        try {
            const returnData = {
                gstr1: { status: 'Filed', period: '2026-04' },
                gstr3b: { status: 'Ready to File', period: '2026-04' }
            };
            return sendSuccess(res, returnData, 'GST returns fetched successfully');
        } catch (error) {
            console.error('[GST Controller] Error getting returns:', error);
            return sendError(res, 'Failed to fetch GST returns', 500);
        }
    }
};

module.exports = gstController;
