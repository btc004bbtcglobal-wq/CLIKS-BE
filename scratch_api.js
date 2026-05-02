const db = require('./db/connection');

async function test() {
  const itemBefore = await db.prepare('SELECT * FROM stock LIMIT 1').get();
  console.log('Original item in DB:', itemBefore);

  await db.prepare('UPDATE stock SET low_stock_threshold = 1000 WHERE id = ?').run(itemBefore.id);

  const itemAfter = await db.prepare('SELECT * FROM stock WHERE id = ?').get(itemBefore.id);
  console.log('Updated item in DB:', itemAfter);
}

test();
