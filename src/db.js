import { createClient } from "@libsql/client";
import dotenv from "dotenv";

<<<<<<< HEAD
sqlite3.verbose();

export const db = await open({
  filename: "./watchads.db",
  driver: sqlite3.Database,
});

await db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  upi_id TEXT,
  balance REAL DEFAULT 0
);
=======
dotenv.config();

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Missing Turso credentials in .env file");
  process.exit(1);
}
>>>>>>> 15e99fa (Updated backend logic / bug fixes)

export const db = createClient({ url, authToken });

// Initialize Tables
async function init() {
  console.log("🔗 Connecting to Turso database...");

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
}

await init();
