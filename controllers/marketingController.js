const db = require('../db/connection');
const { sendSuccess, sendError } = require('../utils/response');

const initTable = async () => {
    try {
        const dbType = process.env.DB_TYPE || 'sqlite';
        const idType = dbType === 'postgres' ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
        
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS marketing_campaigns (
                id ${idType},
                user_id INTEGER NOT NULL,
                campaign_name TEXT NOT NULL,
                campaign_type TEXT DEFAULT 'Email',
                campaign_status TEXT DEFAULT 'Draft',
                target_audience TEXT,
                total_recipients INTEGER DEFAULT 0,
                message_title TEXT,
                message_content TEXT,
                scheduled_date TEXT,
                scheduled_time TEXT,
                sent_count INTEGER DEFAULT 0,
                delivered_count INTEGER DEFAULT 0,
                opened_count INTEGER DEFAULT 0,
                clicked_count INTEGER DEFAULT 0,
                conversion_count INTEGER DEFAULT 0,
                roi_percentage REAL DEFAULT 0,
                created_at TEXT,
                updated_at TEXT
            )
        `).run();
    } catch (err) {
        console.warn('[Marketing Controller] Table Init:', err.message);
    }
};

initTable();

const marketingController = {
    getCampaigns: async (req, res) => {
        try {
            const campaigns = await db.prepare('SELECT * FROM marketing_campaigns WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
            return sendSuccess(res, campaigns, 'Campaigns fetched successfully');
        } catch (error) {
            console.error('[Marketing Controller] Fetch Error:', error);
            return sendError(res, 'Failed to fetch campaigns', 500);
        }
    },

    createCampaign: async (req, res) => {
        const { 
            campaign_name, campaign_type, campaign_status, target_audience, 
            total_recipients, message_title, message_content, scheduled_date, scheduled_time 
        } = req.body;

        if (!campaign_name) return sendError(res, 'Campaign name is required', 400);

        try {
            const now = new Date().toISOString();
            const result = await db.prepare(`
                INSERT INTO marketing_campaigns (
                    user_id, campaign_name, campaign_type, campaign_status, target_audience,
                    total_recipients, message_title, message_content, scheduled_date, scheduled_time,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                req.user.id, campaign_name, campaign_type || 'Email', campaign_status || 'Draft',
                target_audience, total_recipients || 0, message_title, message_content,
                scheduled_date, scheduled_time, now, now
            );

            const newCampaign = await db.prepare('SELECT * FROM marketing_campaigns WHERE id = ?').get(result.lastInsertRowid);
            return sendSuccess(res, newCampaign, 'Campaign created successfully', 201);
        } catch (error) {
            console.error('[Marketing Controller] Create Error:', error);
            return sendError(res, 'Failed to create campaign', 500);
        }
    },

    updateCampaign: async (req, res) => {
        const { id } = req.params;
        const body = req.body;

        try {
            const updates = [];
            const params = [];

            const fields = [
                'campaign_name', 'campaign_type', 'campaign_status', 'target_audience',
                'total_recipients', 'message_title', 'message_content', 'scheduled_date', 
                'scheduled_time', 'sent_count', 'delivered_count', 'opened_count',
                'clicked_count', 'conversion_count', 'roi_percentage'
            ];

            for (const field of fields) {
                if (body[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    params.push(body[field]);
                }
            }

            if (updates.length === 0) return sendError(res, 'No fields to update', 400);

            updates.push('updated_at = ?');
            params.push(new Date().toISOString());
            params.push(id, req.user.id);

            const result = await db.prepare(`
                UPDATE marketing_campaigns SET ${updates.join(', ')} 
                WHERE id = ? AND user_id = ?
            `).run(...params);

            if (result.changes === 0) return sendError(res, 'Campaign not found', 404);

            const updated = await db.prepare('SELECT * FROM marketing_campaigns WHERE id = ?').get(id);
            return sendSuccess(res, updated, 'Campaign updated successfully');
        } catch (error) {
            console.error('[Marketing Controller] Update Error:', error);
            return sendError(res, 'Failed to update campaign', 500);
        }
    },

    deleteCampaign: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.prepare('DELETE FROM marketing_campaigns WHERE id = ? AND user_id = ?').run(id, req.user.id);
            if (result.changes === 0) return sendError(res, 'Campaign not found', 404);
            return sendSuccess(res, null, 'Campaign deleted successfully');
        } catch (error) {
            console.error('[Marketing Controller] Delete Error:', error);
            return sendError(res, 'Failed to delete campaign', 500);
        }
    }
};

module.exports = marketingController;
