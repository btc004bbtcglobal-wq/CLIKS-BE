const bcrypt = require('bcryptjs');
const db = require('../db/connection');

async function seedAgent() {
  console.log('🌱 Seeding default active Sales Agent...');
  
  const email = 'agent@cliks.com';
  const password = 'agentpassword123';
  const name = 'Default Sales Agent';
  const commissionRate = 10.0;
  
  try {
    // Check if agent already exists
    const existing = await db.prepare('SELECT id FROM sales_agents WHERE email = ?').get(email);
    if (existing) {
      console.log(`✅ Sales Agent '${email}' already exists in database.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO sales_agents (name, email, password_hash, commission_rate, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run([name, email, passwordHash, commissionRate, 1, now]);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 PROSPECT SALES AGENT CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Login Email: ${email}`);
    console.log(`🔑 Password:    ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding sales agent:', err.message);
    process.exit(1);
  }
}

seedAgent();
