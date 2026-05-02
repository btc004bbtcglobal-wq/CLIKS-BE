const db = require('./db/connection');

async function test() {
  const stockInfo = await db.prepare(
    `SELECT COUNT(*) as totalItems, COALESCE(SUM(quantity * unit_price), 0) as totalValue FROM stock WHERE user_id = ?`
  ).get(5);
  console.log('Stock query raw result:', stockInfo);

  const walletsInfo = await db.prepare(
    `SELECT COUNT(*) as total, COALESCE(SUM(current_amount), 0) as saved FROM goal_wallets WHERE user_id = ?`
  ).get(5);
  console.log('Wallets query raw result:', walletsInfo);

  const splitsInfo = await db.prepare(
    `SELECT COUNT(*) as total, COALESCE(SUM(total_amount), 0) as totalAmount FROM split_expenses WHERE user_id = ?`
  ).get(5);
  console.log('Splits query raw result:', splitsInfo);
}

test();
