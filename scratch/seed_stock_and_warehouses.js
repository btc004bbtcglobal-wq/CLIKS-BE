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

            // 5. Seed GST Invoices if none exist
            const existingGstInvoices = await db.prepare('SELECT * FROM gst_invoices WHERE user_id = ?').all(userId);
            if (existingGstInvoices.length === 0) {
                // Invoices
                await db.prepare(`
                    INSERT INTO gst_invoices (
                        user_id, invoice_number, client_name, amount, gst_amount, invoice_type, place_of_supply,
                        taxable_value, gst_percentage, cgst_amount, sgst_amount, igst_amount, total_tax,
                        reverse_charge, irn_number, qr_status, is_eway_bill, is_reconciliation, created_at
                    ) VALUES (?, 'GST-2026-104', 'CLIKS Digital Services', 118000, 18000, 'B2B', '27-Maharashtra',
                             100000, 18, 9000, 9000, 0, 18000, 'No', '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
                             'Generated', 'false', 'false', ?)
                `).run(userId, now);

                await db.prepare(`
                    INSERT INTO gst_invoices (
                        user_id, invoice_number, client_name, amount, gst_amount, invoice_type, place_of_supply,
                        taxable_value, gst_percentage, cgst_amount, sgst_amount, igst_amount, total_tax,
                        reverse_charge, irn_number, qr_status, is_eway_bill, is_reconciliation, created_at
                    ) VALUES (?, 'GST-2026-105', 'Acme Corporates', 56000, 6000, 'B2C', '29-Karnataka',
                             50000, 12, 0, 0, 6000, 6000, 'No', '5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f',
                             'Generated', 'false', 'false', ?)
                `).run(userId, now);

                // e-Way Bills
                await db.prepare(`
                    INSERT INTO gst_invoices (
                        user_id, invoice_number, client_name, amount, gst_amount, eway_bill_number,
                        transporter_name, vehicle_number, transport_distance, dispatch_location, delivery_location,
                        status, is_eway_bill, is_reconciliation, created_at
                    ) VALUES (?, 'GST-2026-104', 'CLIKS Digital Services', 118000, 18000, 'EWB-2026-9011',
                             'Bluedart Freight Ltd.', 'MH-02-EH-9081', 240, 'Mumbai Warehouse', 'Pune Retail Store',
                             'Active', 'true', 'false', ?)
                `).run(userId, now);

                // Reconciliations
                await db.prepare(`
                    INSERT INTO gst_invoices (
                        user_id, invoice_number, client_name, amount, gst_amount, vendor_gstin, vendor_name,
                        taxable_value, cgst_amount, sgst_amount, igst_amount, eligible_itc, invoice_match_status,
                        mismatch_reason, reconciliation_date, is_reconciliation, created_at
                    ) VALUES (?, 'RECON-101', 'Acme Hardware Corporates', 35000, 6300, '27AAAAA1111A1Z1', 'Acme Hardware Corporates',
                             35000, 3150, 3150, 0, 6300, 'matched', 'None', '2026-05-01', 'true', ?)
                `).run(userId, now);

                await db.prepare(`
                    INSERT INTO gst_invoices (
                        user_id, invoice_number, client_name, amount, gst_amount, vendor_gstin, vendor_name,
                        taxable_value, cgst_amount, sgst_amount, igst_amount, eligible_itc, invoice_match_status,
                        mismatch_reason, reconciliation_date, is_reconciliation, created_at
                    ) VALUES (?, 'RECON-102', 'Bengaluru Spares Ltd.', 15000, 2700, '29BBBBB2222B2Z2', 'Bengaluru Spares Ltd.',
                             15000, 0, 0, 2700, 2700, 'mismatch', 'Tax rate mismatch (Supplier logged 12% instead of 18%)', '2026-05-03', 'true', ?)
                `).run(userId, now);

                console.log(`  Seeded GST invoices and reconciliations for user ${userId}.`);
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
