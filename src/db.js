import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const db = await open({
  filename: "./watchads.db",
  driver: sqlite3.Database,
});

await db.exec(`
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS watched_ads;
DROP TABLE IF EXISTS payouts;

CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  reward REAL NOT NULL,
  video_url TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  balance REAL DEFAULT 0,
  upi_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS watched_ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  ad_id INTEGER,
  watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(ad_id) REFERENCES ads(id)
);

CREATE TABLE IF NOT EXISTS payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  amount REAL,
  upi_id TEXT,
  admin_share REAL,
  user_share REAL,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

const adCount = await db.get("SELECT COUNT(*) as count FROM ads");
if (adCount.count === 0) {
  await db.run(
    "INSERT INTO ads (title, description, reward, video_url) VALUES (?, ?, ?, ?)",
    ["Watch Video Ad", "Earn money by watching this ad", 1, "https://www.w3schools.com/html/mov_bbb.mp4"]
  );
  await db.run(
    "INSERT INTO ads (title, description, reward, video_url) VALUES (?, ?, ?, ?)",
    ["Promo Ad", "Special offer ad to earn rewards", 2, "https://www.w3schools.com/html/movie.mp4"]
  );
  await db.run(
    "INSERT INTO ads (title, description, reward, video_url) VALUES (?, ?, ?, ?)",
    ["Game Ad", "Watch this game ad and earn", 1.5, "https://www.w3schools.com/html/mov_bbb.mp4"]
  );
}
