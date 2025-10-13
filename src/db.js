import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config();

// Load Turso credentials from .env
const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Missing Turso credentials in .env file");
  process.exit(1);
}

// Create Turso client
export const db = createClient({ url, authToken });

// Initialize tables
async function init() {
  console.log("🔗 Connecting to Turso database...");

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        upi_id TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance REAL DEFAULT 0
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS ads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        video_url TEXT,
        reward REAL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS watched_ads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        ad_id INTEGER,
        watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(ad_id) REFERENCES ads(id)
      );
    `);

    console.log("✅ Turso DB initialized successfully!");
  } catch (err) {
    console.error("❌ Failed to initialize Turso DB:", err);
    process.exit(1);
  }
}

// Immediately initialize the DB
await init();
