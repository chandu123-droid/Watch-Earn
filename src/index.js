import 'dotenv/config';
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

import { db } from "./db.js";
import { registerUser, loginUser, getAds, watchAd, getUserBalance, sendPayout } from "./queries.js";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "supersecretkey";

// Middleware to check JWT token
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

// Register route
app.post("/register", async (req, res) => {
  const { name, email, password, upi_id } = req.body;
  try {
    await registerUser(name, email, password, upi_id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await loginUser(email, password);
    if (!result) return res.status(400).json({ error: "Invalid credentials" });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get ads
app.get("/ads", authMiddleware, async (req, res) => {
  try {
    const ads = await getAds();
    res.json(ads);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Start watching ad (no reward yet)
app.post("/watch/:adId/start", authMiddleware, async (req, res) => {
  const adId = req.params.adId;
  try {
    const ad = await db.get("SELECT * FROM ads WHERE id = ?", [adId]);
    if (!ad) return res.status(404).json({ error: "Ad not found" });

    res.json({ message: "Ad started" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Complete watching ad (adds reward)
app.post("/watch/:adId/complete", authMiddleware, async (req, res) => {
  const adId = req.params.adId;
  try {
    const ad = await db.get("SELECT * FROM ads WHERE id = ?", [adId]);
    if (!ad) return res.status(404).json({ error: "Ad not found" });

    // Record watched ad
    await db.run("INSERT INTO watched_ads (user_id, ad_id) VALUES (?, ?)", [req.user.id, adId]);

    // Update user balance
    await db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [ad.reward, req.user.id]);

    res.json({ reward: ad.reward });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get user balance
app.get("/balance", authMiddleware, async (req, res) => {
  try {
    const data = await getUserBalance(req.user.id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Withdraw route
app.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const { upi_id } = req.body;
    const payout = await sendPayout(req.user.id, upi_id);
    res.json(payout);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
