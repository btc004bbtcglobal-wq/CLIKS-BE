const db = require('./db/connection');

async function runTest() {
    try {
        const now = new Date().toISOString();
        const invAmt = 1000;
        const pct = 18;
        const calculatedTax = 180;
        const input_cgst = 90;
        const input_sgst = 90;
        const input_igst = 0;
        const vendor_gstin = '27AAAAA1111A1Z1';
        const vendor_name = 'Test Vendor';
        const match_status = 'matched';

        // Test reconciliation insert
        const recResult = await db.prepare(`
            INSERT INTO gst_invoices (
                user_id, invoice_number, client_name, vendor_gstin, vendor_name, invoice_amount, gst_percentage,
                input_cgst, input_sgst, input_igst, eligible_itc, invoice_match_status,
                mismatch_reason, is_reconciliation, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'true', ?)
        `).run(
            1, 'REC-TEST-1234', vendor_name, vendor_gstin, vendor_name, invAmt, pct,
            input_cgst, input_sgst, input_igst, calculatedTax, match_status,
            'None', now
        );
        console.log('RECONCILIATION INSERT SUCCESS:', recResult);

        // Test E-way bill insert
        const ewbNum = 'EWB-2026-TEST';
        const transporter_name = 'Test Transporter';
        const ewbResult = await db.prepare(`
            INSERT INTO gst_invoices (
                user_id, invoice_number, client_name, eway_bill_number, transporter_name, vehicle_number, transport_distance,
                dispatch_location, delivery_location, status, is_eway_bill, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 'true', ?)
        `).run(
            1, ewbNum, transporter_name, ewbNum, transporter_name, 'MH-02-AB-1234', 100,
            'Warehouse A', 'Warehouse B', now
        );
        console.log('EWAY BILL INSERT SUCCESS:', ewbResult);

    } catch (err) {
        console.error('ERROR:', err);
    }
}

runTest();
