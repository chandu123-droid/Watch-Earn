import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
<<<<<<< HEAD
import { registerUser, loginUser, getAds, watchAd, getUserBalance, sendPayout } from "./queries.js";
=======
import {
  registerUser,
  loginUser,
  getAds,
  watchAd,
  getUserBalance,
  sendPayout,
} from "./queries.js";
>>>>>>> 15e99fa (Updated backend logic / bug fixes)

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "supersecretkey";

<<<<<<< HEAD
=======
// ---------------------------
// AUTH MIDDLEWARE
// ---------------------------
>>>>>>> 15e99fa (Updated backend logic / bug fixes)
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

<<<<<<< HEAD
// ROUTES
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, upi_id } = req.body;
    await registerUser(name, email, password, upi_id);
    res.json({ success: true });
=======
// ---------------------------
// ROUTES
// ---------------------------
app.post("/register", async (req, res) => {
  try {
    const { name, upi_id, email, password } = req.body;
    const result = await registerUser(name, upi_id, email, password);
    res.json(result);
>>>>>>> 15e99fa (Updated backend logic / bug fixes)
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
<<<<<<< HEAD
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  if (!result) return res.status(400).json({ error: "Invalid credentials" });
  res.json(result);
=======
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    if (!result) return res.status(400).json({ error: "Invalid credentials" });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
>>>>>>> 15e99fa (Updated backend logic / bug fixes)
});

app.get("/ads", authMiddleware, async (req, res) => {
  try {
    const ads = await getAds();
    res.json(ads);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/watch/:adId/complete", authMiddleware, async (req, res) => {
  try {
<<<<<<< HEAD
=======
    const adId = req.params.adId;
>>>>>>> 15e99fa (Updated backend logic / bug fixes)
    const reward = await watchAd(req.user.id, adId);
    res.json({ reward });
  } catch (e) {
    res.status(400).json({ error: e.message });
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

app.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const { upi_id } = req.body;
    const payout = await sendPayout(req.user.id, upi_id);
    res.json(payout);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---------------------------
// START SERVER
// ---------------------------
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
