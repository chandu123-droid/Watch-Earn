import sqlite3 from "sqlite3";
import { open } from "sqlite";

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

CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  video_url TEXT,
  reward REAL
);

CREATE TABLE IF NOT EXISTS watched_ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  ad_id INTEGER,
  watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(ad_id) REFERENCES ads(id)
);
`);
