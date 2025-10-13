import { db } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";
const ADMIN_UPI = "myacct597@okaxis";

<<<<<<< HEAD
// ---------------------- USERS ---------------------- //
export async function registerUser(name, email, password, upi_id) {
  if (!name || !email || !password || !upi_id)
    throw new Error("All fields required");
=======
// ---------------------------
// REGISTER USER
// ---------------------------
export async function registerUser(name, upi_id, email, password) {
  if (!name || !upi_id || !email || !password)
    throw new Error("All fields are required");
>>>>>>> 15e99fa (Updated backend logic / bug fixes)

  const hash = await bcrypt.hash(password, 10);

  try {
    await db.execute({
      sql: "INSERT INTO users (name, upi_id, email, password, balance) VALUES (?, ?, ?, ?, 0)",
      args: [name, upi_id, email, hash],
    });
    return { success: true };
  } catch (err) {
    if (err.message.includes("UNIQUE")) throw new Error("Email already registered");
    else throw err;
  }
}

// ---------------------------
// LOGIN USER
// ---------------------------
export async function loginUser(email, password) {
<<<<<<< HEAD
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) throw new Error("Email not registered");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
=======
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email],
  });
  const user = result.rows[0];
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
>>>>>>> 15e99fa (Updated backend logic / bug fixes)

  const token = jwt.sign({ id: user.id }, SECRET);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      upi_id: user.upi_id,
      balance: user.balance,
    },
    token,
  };
}

// ---------------------------
// GET ADS
// ---------------------------
export async function getAds() {
  const result = await db.execute("SELECT * FROM ads");
  return result.rows;
}

<<<<<<< HEAD
// ✅ Unlimited watch ads — reward every time
=======
// ---------------------------
// WATCH AD (Add Reward)
// ---------------------------
>>>>>>> 15e99fa (Updated backend logic / bug fixes)
export async function watchAd(userId, adId) {
  const adResult = await db.execute({
    sql: "SELECT * FROM ads WHERE id = ?",
    args: [adId],
  });
  const ad = adResult.rows[0];
  if (!ad) throw new Error("Ad not found");

<<<<<<< HEAD
  // Always insert new record — no duplicate check
  await db.run("INSERT INTO watched_ads (user_id, ad_id) VALUES (?, ?)", [userId, adId]);

  // Reward the user every time
  await db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [ad.reward, userId]);
=======
  // Insert watch record
  await db.execute({
    sql: "INSERT INTO watched_ads (user_id, ad_id) VALUES (?, ?)",
    args: [userId, adId],
  });

  // Add reward to user's balance
  await db.execute({
    sql: "UPDATE users SET balance = balance + ? WHERE id = ?",
    args: [ad.reward, userId],
  });
>>>>>>> 15e99fa (Updated backend logic / bug fixes)

  return ad.reward;
}

<<<<<<< HEAD
// ---------------------- BALANCE ---------------------- //
=======
// ---------------------------
// GET USER BALANCE
// ---------------------------
>>>>>>> 15e99fa (Updated backend logic / bug fixes)
export async function getUserBalance(userId) {
  const result = await db.execute({
    sql: "SELECT balance, upi_id FROM users WHERE id = ?",
    args: [userId],
  });
  return result.rows[0];
}

<<<<<<< HEAD
// ---------------------- WITHDRAW ---------------------- //
=======
// ---------------------------
// WITHDRAW (Simulated)
// ---------------------------
>>>>>>> 15e99fa (Updated backend logic / bug fixes)
export async function sendPayout(userId, upi) {
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [userId],
  });
  const user = result.rows[0];
  if (!user) throw new Error("User not found");

  const finalUpi = upi || user.upi_id;
  if (!finalUpi) throw new Error("UPI ID required");
  if (user.balance < 1) throw new Error("Minimum ₹1 required");

  const user_share = (user.balance * 0.4).toFixed(2);
  const admin_share = (user.balance * 0.6).toFixed(2);

<<<<<<< HEAD
  await db.run("UPDATE users SET balance = 0 WHERE id = ?", [userId]);

  return {
    message: "Payout processed successfully",
    user_share,
    admin_share,
    upi: finalUpi,
    admin_upi: ADMIN_UPI,
  };
=======
  await db.execute({
    sql: "UPDATE users SET balance = 0 WHERE id = ?",
    args: [userId],
  });

  return { user_share, admin_share, user_upi: finalUpi, admin_upi: ADMIN_UPI };
>>>>>>> 15e99fa (Updated backend logic / bug fixes)
}
