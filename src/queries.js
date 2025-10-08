import { db } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

// ---------------------- AUTH ---------------------- //
export async function registerUser(name, email, password, upi_id) {
  if (!name || !email || !password || !upi_id) throw new Error("All fields required");
  const hash = await bcrypt.hash(password, 10);
  return await db.run(
    "INSERT INTO users (name, email, password, upi_id) VALUES (?, ?, ?, ?)",
    [name, email, hash, upi_id]
  );
}

export async function loginUser(email, password) {
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  const token = jwt.sign({ id: user.id }, SECRET);
  return { user, token };
}

// ---------------------- ADS ---------------------- //
export async function getAds() {
  return await db.all("SELECT * FROM ads");
}

export async function watchAd(userId, adId) {
  const ad = await db.get("SELECT * FROM ads WHERE id = ?", [adId]);
  if (!ad) throw new Error("Ad not found");

  // Check if already watched
  const already = await db.get(
    "SELECT * FROM watched_ads WHERE user_id = ? AND ad_id = ?",
    [userId, adId]
  );
  if (already) throw new Error("Ad already watched");

  await db.run("INSERT INTO watched_ads (user_id, ad_id) VALUES (?, ?)", [userId, adId]);
  await db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [ad.reward, userId]);
  return ad.reward;
}

export async function getUserBalance(userId) {
  const user = await db.get("SELECT balance, upi_id FROM users WHERE id = ?", [userId]);
  return { balance: user.balance, upi_id: user.upi_id };
}

// ---------------------- SIMULATED WITHDRAW ---------------------- //
export async function sendPayout(userId, upi_id) {
  const user = await db.get("SELECT balance FROM users WHERE id = ?", [userId]);
  if (!user) throw new Error("User not found");

  if (user.balance < 1) throw new Error("Minimum ₹1 required for withdrawal");

  const userShare = (user.balance * 0.4).toFixed(2);
  const adminShare = (user.balance * 0.6).toFixed(2);

  // Simulate payout
  await db.run("UPDATE users SET balance = 0 WHERE id = ?", [userId]);

  return {
    message: `Withdrawal simulated: ₹${userShare} to user, ₹${adminShare} to admin.`,
    payoutId: `SIMULATED_${Date.now()}`,
  };
}
