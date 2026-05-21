const db = require('./db/connection');

async function check() {
  try {
    const users = await db.prepare("SELECT id, username, email FROM users").all();
    console.log("=== USERS ===");
    console.log(users);

    const clientsCount = await db.prepare("SELECT ca_user_id, COUNT(*) as count FROM ca_clients GROUP BY ca_user_id").all();
    console.log("\n=== CA CLIENTS COUNT ===");
    console.log(clientsCount);

    const allClients = await db.prepare("SELECT * FROM ca_clients").all();
    console.log("\n=== ALL CA CLIENTS IN DB ===");
    console.log(allClients);

    const invitations = await db.prepare("SELECT * FROM ca_invitations").all();
    console.log("\n=== CA INVITATIONS ===");
    console.log(invitations);
  } catch (err) {
    console.error("DB Check Error:", err.message);
  }
}

check();
