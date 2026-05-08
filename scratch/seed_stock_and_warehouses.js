const db = require('../db/connection');

async function seed() {
    console.log('Starting stock and warehouse seeding for all users...');
    const now = new Date().toISOString();

    try {
        // Fetch all users
        const users = await db.prepare('SELECT id FROM users').all();
        console.log(`Found ${users.length} users to seed.`);

        for (const user of users) {
            const userId = user.id;
            console.log(`Seeding user ${userId}...`);

            // 1. Seed Warehouses if they don't exist
            const existingWarehouses = await db.prepare('SELECT * FROM warehouses WHERE user_id = ?').all(userId);
            let godownId, shopId;

            if (existingWarehouses.length === 0) {
                const wh1 = await db.prepare(
                    `INSERT INTO warehouses (user_id, name, location, code, type, status, address, city, state, pincode, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).run(userId, 'Main Godown', 'Sector 4, Industrial Area', 'WH-MUM-01', 'godown', 'active', 'Plot 12, Sector 4', 'Mumbai', 'Maharashtra', '400001', now);
                
                const wh2 = await db.prepare(
                    `INSERT INTO warehouses (user_id, name, location, code, type, status, address, city, state, pincode, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).run(userId, 'Shop Front', 'MG Road Shopping Mall', 'WH-PUN-02', 'retail', 'active', 'Shop 105, MG Road', 'Pune', 'Maharashtra', '411001', now);

                godownId = wh1.lastInsertRowid;
                shopId = wh2.lastInsertRowid;
                console.log(`  Seeded 2 warehouses for user ${userId}.`);
            } else {
                godownId = existingWarehouses[0].id;
                shopId = existingWarehouses[1] ? existingWarehouses[1].id : godownId;
            }

            // 2. Seed Stock items if they don't exist or are fewer than 3
            const existingStocks = await db.prepare('SELECT * FROM stock WHERE user_id = ?').all(userId);
            
            if (existingStocks.length < 3) {
                // Clear existing small stock for consistency
                if (existingStocks.length > 0) {
                    await db.prepare('DELETE FROM stock WHERE user_id = ?').run(userId);
                }

                const s1 = await db.prepare(`
                    INSERT INTO stock (user_id, name, sku, quantity, unit, unit_price, category, location, notes, low_stock_threshold, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(userId, 'Dell Inspiron 15 Laptop', 'LAP-DELL-15', 125, 'pcs', 35000, 'Electronics', 'Main Godown (Rack A-3)', 'High-performance business laptops', 20, now, now);

                const s2 = await db.prepare(`
                    INSERT INTO stock (user_id, name, sku, quantity, unit, unit_price, category, location, notes, low_stock_threshold, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(userId, 'Boat Bassheads Earphones', 'EAR-BOAT-02', 15, 'pcs', 250, 'Accessories', 'Shop Front (Shelf B-2)', 'Wired in-ear headphones', 50, now, now);

                const s3 = await db.prepare(`
                    INSERT INTO stock (user_id, name, sku, quantity, unit, unit_price, category, location, notes, low_stock_threshold, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(userId, 'Wireless Keyboard', 'KEY-WIRE-01', 45, 'pcs', 1500, 'Peripherals', 'Main Godown (Rack B-1)', 'Multi-device bluetooth keyboards', 10, now, now);

                const stock1Id = s1.lastInsertRowid;
                const stock2Id = s2.lastInsertRowid;
                const stock3Id = s3.lastInsertRowid;

                console.log(`  Seeded 3 stock items for user ${userId}.`);

                // 3. Seed Stock Transactions
                await db.prepare(`INSERT INTO stock_transactions (stock_id, user_id, type, quantity, date, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(stock1Id, userId, 'in', 100, now, now);
                await db.prepare(`INSERT INTO stock_transactions (stock_id, user_id, type, quantity, date, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(stock1Id, userId, 'in', 25, now, now);
                await db.prepare(`INSERT INTO stock_transactions (stock_id, user_id, type, quantity, date, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(stock2Id, userId, 'in', 15, now, now);
                await db.prepare(`INSERT INTO stock_transactions (stock_id, user_id, type, quantity, date, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(stock3Id, userId, 'in', 50, now, now);
                await db.prepare(`INSERT INTO stock_transactions (stock_id, user_id, type, quantity, date, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(stock3Id, userId, 'out', 5, now, now);

                console.log(`  Seeded 5 stock transactions for user ${userId}.`);

                // 4. Seed Warehouse Transfers
                await db.prepare(`
                    INSERT INTO warehouse_transfers (user_id, from_warehouse_id, to_warehouse_id, stock_id, quantity, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(userId, godownId, shopId, stock2Id, 20, now);

                await db.prepare(`
                    INSERT INTO warehouse_transfers (user_id, from_warehouse_id, to_warehouse_id, stock_id, quantity, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(userId, godownId, shopId, stock1Id, 5, now);

                console.log(`  Seeded 2 warehouse transfers for user ${userId}.`);
            }
        }

        console.log('✅ Seeding stock and warehouse data completed successfully for all users!');
    } catch (err) {
        console.error('❌ Seeding failed with error:', err);
    } finally {
        process.exit();
    }
}

seed();
