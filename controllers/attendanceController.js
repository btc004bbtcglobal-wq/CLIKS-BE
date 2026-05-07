const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');

const attendanceController = {
    checkIn: async (req, res) => {
        const { employee_id } = req.body;
        try {
            const today = new Date().toISOString().split('T')[0];
            const now = new Date().toISOString();
            const result = await db.prepare(
                `INSERT INTO attendance (user_id, employee_id, date, check_in, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).run(req.user.id, employee_id || null, today, now, 'Present', now);

            return sendSuccess(res, { id: result.lastInsertRowid, check_in: now }, 'Checked in successfully', 201);
        } catch (error) {
            console.error('[Attendance Controller] Error check-in:', error);
            return sendError(res, 'Failed to check in', 500);
        }
    },

    checkOut: async (req, res) => {
        const { employee_id } = req.body;
        try {
            const today = new Date().toISOString().split('T')[0];
            const now = new Date().toISOString();
            await db.prepare(
                `UPDATE attendance SET check_out = ? WHERE user_id = ? AND date = ? AND (employee_id = ? OR employee_id IS NULL)`
            ).run(now, req.user.id, today, employee_id || null);

            return sendSuccess(res, { check_out: now }, 'Checked out successfully');
        } catch (error) {
            console.error('[Attendance Controller] Error check-out:', error);
            return sendError(res, 'Failed to check out', 500);
        }
    },

    getReports: async (req, res) => {
        try {
            const reports = await db.prepare('SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC').all(req.user.id);
            return sendSuccess(res, reports, 'Attendance reports fetched successfully');
        } catch (error) {
            console.error('[Attendance Controller] Error fetching reports:', error);
            return sendError(res, 'Failed to fetch attendance reports', 500);
        }
    },

    correction: async (req, res) => {
        const { id, check_in, check_out, status } = req.body;
        if (!id) return sendError(res, 'ID is required', 400);
        try {
            await db.prepare(
                `UPDATE attendance SET check_in = ?, check_out = ?, status = ? WHERE id = ? AND user_id = ?`
            ).run(check_in || null, check_out || null, status || 'Present', id, req.user.id);

            return sendSuccess(res, null, 'Attendance corrected successfully');
        } catch (error) {
            console.error('[Attendance Controller] Error correcting attendance:', error);
            return sendError(res, 'Failed to correct attendance', 500);
        }
    }
};

module.exports = attendanceController;
