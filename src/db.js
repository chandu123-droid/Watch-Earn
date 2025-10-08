import sqlite3 from "sqlite3";
import { open } from "sqlite";

export let db;

export async function initDB() {
  db = await open({
    filename: "./watchads.db",
    driver: sqlite3.Database,
  });

  // Create tables if not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      upi_id TEXT,
      balance REAL DEFAULT 0
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      reward REAL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS watched_ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      ad_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(ad_id) REFERENCES ads(id)
    )
  `);

  // Insert sample ads if table is empty
  const adsCount = await db.get("SELECT COUNT(*) as count FROM ads");
  if (adsCount.count === 0) {
    await db.exec(`
      INSERT INTO ads (name, description, reward) VALUES
      ('Video Ad', 'Earn by watching this ad', 1),
      ('Promo Ad', 'Special offer ad to earn rewards', 2),
      ('Game Ad', 'Watch this game ad and earn', 1.5)
    `);
  }

  console.log("Database initialized");
}
