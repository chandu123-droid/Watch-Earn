import sqlite3 from "sqlite3";
import { open } from "sqlite";

<<<<<<< HEAD
sqlite3.verbose();

export const db = await open({
  filename: "./watchads.db",
  driver: sqlite3.Database,
});

=======
// Enable verbose mode for debugging
sqlite3.verbose();

// Open database connection
export const db = await open({
  filename: "./watchads.db", // make sure the path is correct
  driver: sqlite3.Database,
});

// Initialize tables if not exist
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
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
<<<<<<< HEAD
  video_url TEXT,
=======
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
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
