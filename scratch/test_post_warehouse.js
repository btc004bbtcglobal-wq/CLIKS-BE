const db = require('../db/connection');

async function test() {
    const now = new Date().toISOString();
    try {
        const result = await db.prepare(
            `INSERT INTO warehouses (
                user_id, name, location, code, type, status, address, city, state, pincode, 
                contact_person, phone_number, email, capacity_utilization, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
            1, 'Test Warehouse', 'Test Location', 'WH-TST-99', 'godown', 'active',
            '123 Street', 'Test City', 'Test State', '123456',
            'John Doe', '1234567890', 'john@example.com', '10%', now
        );

        console.log('Result:', result);
        const inserted = await db.prepare('SELECT * FROM warehouses WHERE id = ?').get(result.lastInsertRowid);
        console.log('Inserted:', inserted);
        console.log('✅ POST /warehouses test completed successfully!');
    } catch (err) {
        console.error('❌ Test failed with error:', err);
    } finally {
        process.exit();
    }
}

test();
