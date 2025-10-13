// ---------------------------
// IMPORTS
// ---------------------------
import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import path from "path";
import {
  registerUser,
  loginUser,
  getAds,
  watchAd,
  getUserBalance,
  sendPayout,
} from "./queries.js";

// ---------------------------
// APP SETUP
// ---------------------------
const app = express();
const __dirname = path.resolve();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-frontend-domain.com"], // add your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// ---------------------------
// CONSTANTS
// ---------------------------
const SECRET = process.env.JWT_SECRET || "supersecretkey";

// ---------------------------
// AUTH MIDDLEWARE
// ---------------------------
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

// ---------------------------
// API ROUTES
// ---------------------------

// REGISTER USER
app.post("/register", async (req, res) => {
  try {
    const { name, upi_id, email, password } = req.body;
    const result = await registerUser(name, upi_id, email, password);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// LOGIN USER
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    if (!result) return res.status(400).json({ error: "Invalid credentials" });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET ALL ADS
app.get("/ads", authMiddleware, async (req, res) => {
  try {
    const ads = await getAds();
    res.json(ads);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// WATCH AD
app.post("/watch/:adId/complete", authMiddleware, async (req, res) => {
  try {
    const adId = req.params.adId;
    const reward = await watchAd(req.user.id, adId);
    res.json({ reward });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET USER BALANCE
app.get("/balance", authMiddleware, async (req, res) => {
  try {
    const data = await getUserBalance(req.user.id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// WITHDRAW BALANCE
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
// STATIC FRONTEND (FIX FOR "NOT FOUND")
// ---------------------------

// ✅ Serve frontend build folder (adjust if needed)
app.use(express.static(path.join(__dirname, "client", "dist"))); // or "client/build" if React

// ✅ Handle any unknown routes (React Router fix)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
