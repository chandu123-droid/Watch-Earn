import 'dotenv/config';
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
<<<<<<< HEAD
import { registerUser, loginUser, getAds, watchAd, getUserBalance, sendPayout } from "./queries.js";
=======
import { db } from "./db.js";
import { registerUser, loginUser, getAds, getUserBalance } from "./queries.js";
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca

const app = express();
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
const SECRET = process.env.JWT_SECRET || "supersecretkey";
=======
const SECRET = "supersecretkey";
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca

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

app.post("/register", async (req, res) => {
<<<<<<< HEAD
  try {
    const { name, email, password, upi_id } = req.body;
=======
  const { name, email, password, upi_id } = req.body;
  try {
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
    await registerUser(name, email, password, upi_id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
<<<<<<< HEAD
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
=======
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  if (!result) return res.status(400).json({ error: "Invalid credentials" });
  res.json(result);
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
});

app.get("/ads", authMiddleware, async (req, res) => {
  try {
    const ads = await getAds();
    res.json(ads);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

<<<<<<< HEAD
app.post("/watch/:adId/complete", authMiddleware, async (req, res) => {
  try {
    const reward = await watchAd(req.user.id, req.params.adId);
    res.json({ reward });
  } catch (e) {
    res.status(400).json({ error: e.message });
=======
// Start watching ad (logs start, no reward yet)
app.post("/watch/:adId/start", authMiddleware, async (req, res) => {
  const adId = req.params.adId;
  try {
    const ad = await db.get("SELECT * FROM ads WHERE id = ?", [adId]);
    if (!ad) return res.status(404).json({ error: "Ad not found" });

    // Could log start if needed
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

    // Insert into watched_ads for record
    await db.run("INSERT INTO watched_ads (user_id, ad_id) VALUES (?, ?)", [req.user.id, adId]);

    // Update user balance
    await db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [ad.reward, req.user.id]);

    res.json({ reward: ad.reward });
  } catch (e) {
    res.status(500).json({ error: e.message });
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
  }
});

app.get("/balance", authMiddleware, async (req, res) => {
  try {
    const data = await getUserBalance(req.user.id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

<<<<<<< HEAD
app.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const { upi_id } = req.body;
    const payout = await sendPayout(req.user.id, upi_id);
    res.json(payout);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

=======
>>>>>>> e6a4b1351a932768bc2aa54b9af1c8092d37d8ca
app.listen(5000, () => console.log("Server running on port 5000"));
