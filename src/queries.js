import { db } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------------- USER QUERIES ---------------------- //

export async function registerUser(name, email, password, upi_id) {
  if (!name || !email || !password || !upi_id) {
    throw new Error("All fields are required");
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await db.run(
      "INSERT INTO users (name, email, password, upi_id) VALUES (?, ?, ?, ?)",
      [name, email, hash, upi_id]
    );
    return result;
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      throw new Error("Email already exists");
    }
    throw err;
  }
}

export async function loginUser(email, password) {
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  const token = jwt.sign({ id: user.id }, SECRET);
  return { user, token };
}

// ---------------------- ADS QUERIES ---------------------- //

export async function getAds() {
  return await db.all("SELECT * FROM ads");
}

export async function watchAd(userId, adId) {
  const ad = await db.get("SELECT * FROM ads WHERE id = ?", [adId]);
  if (!ad) throw new Error("Ad not found");

  // Prevent duplicate watch
  const alreadyWatched = await db.get(
    "SELECT * FROM watched_ads WHERE user_id = ? AND ad_id = ?",
    [userId, adId]
  );
  if (alreadyWatched) {
    throw new Error("You have already watched this ad");
  }

  // Insert watched record
  await db.run("INSERT INTO watched_ads (user_id, ad_id) VALUES (?, ?)", [userId, adId]);

  // Update user balance
  await db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [ad.reward, userId]);

  return ad.reward;
}

export async function getUserBalance(userId) {
  const user = await db.get("SELECT balance, upi_id FROM users WHERE id = ?", [userId]);
  if (!user) throw new Error("User not found");

  return { balance: user.balance, upi_id: user.upi_id };
}

// ---------------------- WITHDRAWAL (RAZORPAY) ---------------------- //

export async function sendPayout(userId, userUpi) {
  const user = await db.get("SELECT balance FROM users WHERE id = ?", [userId]);
  if (!user) throw new Error("User not found");

  if (user.balance < 1) {
    throw new Error("Minimum withdrawal is ₹1");
  }

  const userShare = (user.balance * 0.4).toFixed(2);
  const adminShare = (user.balance * 0.6).toFixed(2);

  // Razorpay Payout Request
  const payout = await razorpay.payouts.create({
    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // your UPI/Account
    amount: userShare * 100, // in paise
    currency: "INR",
    mode: "UPI",
    purpose: "payout",
    fund_account: {
      account_type: "vpa",
      vpa: userUpi,
    },
    narration: `Your 40% share from Watch & Earn`,
  });

  // Reset user balance
  await db.run("UPDATE users SET balance = 0 WHERE id = ?", [userId]);

  return {
    message: `Payout of ₹${userShare} to ${userUpi} processed successfully.`,
    payoutId: payout.id,
  };
}
