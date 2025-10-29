import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db.js"; // keep this for your database connection

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------
// CONSTANTS
// ----------------------------------------
const SECRET = process.env.JWT_SECRET || "supersecretkey";
const ADMIN_UPI = "myacct597@okaxis";

// ----------------------------------------
// AUTH MIDDLEWARE
// ----------------------------------------
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ----------------------------------------
// REGISTER USER
// ----------------------------------------
app.post("/register", async (req, res) => {
  try {
    const { name, upi_id, email, password } = req.body;
    if (!name || !upi_id || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.execute({
      sql: "INSERT INTO users (name, upi_id, email, password, balance) VALUES (?, ?, ?, ?, 0)",
      args: [name, upi_id, email, hash],
    });

    res.json({ success: true });
  } catch (err) {
    if (err.message.includes("UNIQUE"))
      res.status(400).json({ error: "Email already registered" });
    else res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// LOGIN USER (Optimized)
// ---------------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Basic validation
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    // 2️⃣ Step 1: Fetch only password hash first
    const passResult = await db.execute({
      sql: "SELECT id, password FROM users WHERE email = ?",
      args: [email],
    });

    const userPassData = passResult.rows[0];
    if (!userPassData)
      return res.status(400).json({ error: "Email not registered" });

    // 3️⃣ Step 2: Verify password
    const isValid = await bcrypt.compare(password, userPassData.password);
    if (!isValid)
      return res.status(400).json({ error: "Invalid credentials" });

    // 4️⃣ Step 3: Fetch rest of user data only after password verified
    const userResult = await db.execute({
      sql: "SELECT id, name, email, upi_id, balance FROM users WHERE id = ?",
      args: [userPassData.id],
    });

    const user = userResult.rows[0];

    // 5️⃣ Generate JWT token
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });

    // 6️⃣ Send response
    res.json({ user, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong, please try again" });
  }
});
// ----------------------------------------
// GET ADS
// ----------------------------------------
app.get("/ads", authMiddleware, async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM ads");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----------------------------------------
// WATCH AD (Reward User)
// ----------------------------------------
app.post("/watch/:adId/complete", authMiddleware, async (req, res) => {
  try {
    const adId = req.params.adId;
    const userId = req.user.id;

    const adResult = await db.execute({
      sql: "SELECT * FROM ads WHERE id = ?",
      args: [adId],
    });
    const ad = adResult.rows[0];
    if (!ad) return res.status(404).json({ error: "Ad not found" });

    await db.execute({
      sql: "INSERT INTO watched_ads (user_id, ad_id) VALUES (?, ?)",
      args: [userId, adId],
    });

    await db.execute({
      sql: "UPDATE users SET balance = balance + ? WHERE id = ?",
      args: [ad.reward, userId],
    });

    res.json({ reward: ad.reward });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----------------------------------------
// GET USER BALANCE
// ----------------------------------------
app.get("/balance", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.execute({
      sql: "SELECT balance, upi_id FROM users WHERE id = ?",
      args: [userId],
    });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----------------------------------------
// WITHDRAW BALANCE (Simulated payout)
// ----------------------------------------
app.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { upi_id } = req.body;

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [userId],
    });
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const finalUpi = upi_id || user.upi_id;
    if (!finalUpi) return res.status(400).json({ error: "UPI ID required" });
    if (user.balance < 1)
      return res.status(400).json({ error: "Minimum ₹1 required" });

    const user_share = (user.balance * 0.4).toFixed(2);
    const admin_share = (user.balance * 0.6).toFixed(2);

    await db.execute({
      sql: "UPDATE users SET balance = 0 WHERE id = ?",
      args: [userId],
    });

    res.json({
      message: "Payout processed successfully",
      user_share,
      admin_share,
      user_upi: finalUpi,
      admin_upi: ADMIN_UPI,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----------------------------------------
// START SERVER
// ----------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
