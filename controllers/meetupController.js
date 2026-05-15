const db = require('../db/connection');
const jwt = require('jsonwebtoken');

exports.getMeetups = async (req, res) => {
    try {
        // Optionally resolve logged in user to append joined status
        let currentUserId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                currentUserId = decoded?.id || null;
            } catch (e) {
                // suppress decode errors
            }
        }

        let meetups;
        if (currentUserId) {
            // Join with registrations to see if this specific user has reserved
            meetups = await db.prepare(`
                SELECT m.*, 
                       (CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END) as has_joined
                FROM meetups m
                LEFT JOIN meetup_registrations r ON m.id = r.meetup_id AND r.user_id = ?
                ORDER BY m.date ASC
            `).all([currentUserId]);
        } else {
            meetups = await db.prepare('SELECT *, 0 as has_joined FROM meetups ORDER BY date ASC').all();
        }

        res.json({ success: true, data: meetups });
    } catch (error) {
        console.error('Error fetching meetups:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch meetups' });
    }
};

exports.createMeetup = async (req, res) => {
    const { title, type, date, time, location, price, description, category, image_url, icon, gradient, max_seats } = req.body;
    try {
        const userId = req.user?.id || 1; // Fallback to 1 if not authenticated
        const seatsLimit = parseInt(max_seats) || 100;

        const result = await db.prepare(
            `INSERT INTO meetups (user_id, title, type, date, time, location, price, description, category, image_url, icon, gradient, attendees, max_seats, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run([
            userId,
            title,
            type || 'Offline',
            date || new Date().toISOString(),
            time || '00:00',
            location || 'TBA',
            price || 'Free',
            description || '',
            category || 'General',
            image_url || '',
            icon || 'Users',
            gradient || 'linear-gradient(135deg, #1B6B3A 0%, #22C55E 100%)',
            1, // Initial attendee (the host)
            seatsLimit,
            new Date().toISOString()
        ]);

        // Automatically register the host for their own meetup to block seat 1
        const newMeetupId = result.lastInsertRowid || result.id || result[0]?.id;
        if (newMeetupId) {
            try {
                await db.prepare(
                    'INSERT INTO meetup_registrations (meetup_id, user_id, created_at) VALUES (?, ?, ?)'
                ).run([newMeetupId, userId, new Date().toISOString()]);
            } catch (regErr) {
                // Suppress if host registration has issues
            }
        }

        res.status(201).json({
            success: true,
            data: { id: newMeetupId, title, type, date, time, location, price, description, category, image_url, icon, gradient, attendees: 1, max_seats: seatsLimit }
        });
    } catch (error) {
        console.error('Error creating meetup:', error);
        res.status(500).json({ success: false, message: 'Failed to create meetup' });
    }
};

exports.joinMeetup = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Login required to reserve tickets.' });
    }

    try {
        // 1. Fetch current meetup details
        const meetup = await db.prepare('SELECT user_id, attendees, max_seats, title FROM meetups WHERE id = ?').get([id]);
        if (!meetup) {
            return res.status(404).json({ success: false, message: 'Meetup registry not found.' });
        }

        // 2. Check if Host
        if (meetup.user_id === userId) {
            return res.status(400).json({ success: false, message: 'You are the host! You do not need to reserve a ticket.' });
        }

        // 3. Check capacity
        const attendees = parseInt(meetup.attendees) || 0;
        const maxSeats = parseInt(meetup.max_seats) || 100;
        if (attendees >= maxSeats) {
            return res.status(400).json({ success: false, message: 'Meetup FULL! All seats have been fully reserved.' });
        }

        // 4. Check if already registered to prevent dupes
        const duplicate = await db.prepare('SELECT id FROM meetup_registrations WHERE meetup_id = ? AND user_id = ?').get([id, userId]);
        if (duplicate) {
            return res.status(400).json({ success: false, message: 'You have already reserved a seat for this meetup.' });
        }

        // 5. Save registration & increment attendees count
        const now = new Date().toISOString();
        await db.prepare('INSERT INTO meetup_registrations (meetup_id, user_id, created_at) VALUES (?, ?, ?)').run([id, userId, now]);
        await db.prepare('UPDATE meetups SET attendees = attendees + 1 WHERE id = ?').run([id]);

        res.json({ success: true, message: 'Ticket reserved successfully!' });
    } catch (error) {
        console.error('Error joining meetup:', error);
        res.status(500).json({ success: false, message: 'Failed to join meetup' });
    }
};

exports.getAttendees = async (req, res) => {
    const { id } = req.params;
    try {
        // Extract users list joined to this meetup
        const attendees = await db.prepare(`
            SELECT u.id, u.username, u.business_name, u.email, r.created_at as registered_at
            FROM meetup_registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.meetup_id = ?
            ORDER BY r.created_at DESC
        `).all([id]);

        res.json({ success: true, data: attendees });
    } catch (error) {
        console.error('Error fetching meetup attendees:', error);
        res.status(500).json({ success: false, message: 'Failed to aggregate attendee roster.' });
    }
};

exports.verifyRegistration = async (req, res) => {
    const { id, userId } = req.params;
    try {
        const registration = await db.prepare(`
            SELECT r.id, r.created_at, u.username, u.business_name, m.title, m.date, m.time, m.location
            FROM meetup_registrations r
            JOIN users u ON r.user_id = u.id
            JOIN meetups m ON r.meetup_id = m.id
            WHERE r.meetup_id = ? AND r.user_id = ?
        `).get([id, userId]);

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Invalid Pass: No active registration found.' });
        }

        res.json({ success: true, data: registration });
    } catch (error) {
        console.error('Error verifying registration:', error);
        res.status(500).json({ success: false, message: 'Verification database lookup failed.' });
    }
};
