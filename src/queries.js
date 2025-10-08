import { db } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = "supersecretkey";

export async function registerUser(name, email, password, upi_id) {
  if (!name || !email || !password || !upi_id) throw new Error("All fields required");
  const hash = await bcrypt.hash(password, 10);
  return await db.run("INSERT INTO users (name, email, password, upi_id) VALUES (?, ?, ?, ?)", [
    name,
    email,
    hash,
    upi_id,
  ]);
}

export async function loginUser(email, password) {
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  const token = jwt.sign({ id: user.id }, SECRET);
  return { user, token };
}

export async function getAds() {
  return await db.all("SELECT * FROM ads");
}

export async function watchAd(userId, adId) {
  const ad = await db.get("SELECT * FROM ads WHERE id = ?", [adId]);
  if (!ad) throw new Error("Ad not found");

  await db.run("INSERT INTO watched_ads (user_id, ad_id) VALUES (?, ?)", [userId, adId]);
  await db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [ad.reward, userId]);
  return ad.reward;
}

export async function getUserBalance(userId) {
  const user = await db.get("SELECT balance, upi_id FROM users WHERE id = ?", [userId]);
  return { balance: user.balance, upi_id: user.upi_id };
}
