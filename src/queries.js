import { db } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";
<<<<<<< HEAD
const ADMIN_UPI = "myacct597@okaxis";

=======

// ---------------------- USERS ---------------------- //
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
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
<<<<<<< HEAD
  if (!user) throw new Error("Email not registered");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
=======
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
  const token = jwt.sign({ id: user.id }, SECRET);
  return { user, token };
}

<<<<<<< HEAD
=======
// ---------------------- ADS ---------------------- //
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
export async function getAds() {
  return await db.all("SELECT * FROM ads");
}

export async function watchAd(userId, adId) {
  const ad = await db.get("SELECT * FROM ads WHERE id = ?", [adId]);
  if (!ad) throw new Error("Ad not found");

<<<<<<< HEAD
=======
  // Check if user already watched this ad
  const watched = await db.get(
    "SELECT * FROM watched_ads WHERE user_id = ? AND ad_id = ?",
    [userId, adId]
  );
  if (watched) throw new Error("Ad already watched");

>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
  await db.run("INSERT INTO watched_ads (user_id, ad_id) VALUES (?, ?)", [userId, adId]);
  await db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [ad.reward, userId]);
  return ad.reward;
}

export async function getUserBalance(userId) {
  const user = await db.get("SELECT balance, upi_id FROM users WHERE id = ?", [userId]);
  return { balance: user.balance, upi_id: user.upi_id };
}

<<<<<<< HEAD
export async function sendPayout(userId, userUpi) {
  const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) throw new Error("User not found");
  if (!userUpi) userUpi = user.upi_id;
  if (!userUpi) throw new Error("UPI ID required");
=======
// ---------------------- SIMULATED WITHDRAW ---------------------- //
export async function sendPayout(userId, upi) {
  const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) throw new Error("User not found");

  const finalUpi = upi || user.upi_id;
  if (!finalUpi) throw new Error("UPI ID required");
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
  if (user.balance < 1) throw new Error("Minimum ₹1 required");

  const user_share = (user.balance * 0.4).toFixed(2);
  const admin_share = (user.balance * 0.6).toFixed(2);

<<<<<<< HEAD
  await db.run("UPDATE users SET balance = 0 WHERE id = ?", [userId]);

  return { user_share, admin_share, user_upi: userUpi, admin_upi: ADMIN_UPI };
=======
  // Reset user balance
  await db.run("UPDATE users SET balance = 0 WHERE id = ?", [userId]);

  // Return simulated payout info
  return {
    message: `Payout processed`,
    user_share,
    admin_share,
    upi: finalUpi,
  };
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
}
