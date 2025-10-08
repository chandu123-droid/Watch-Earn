import 'dotenv/config';
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { registerUser, loginUser, getAds, watchAd, getUserBalance } from "./queries.js";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "supersecretkey";

// Auth middleware
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

// Register
app.post("/register", async (req, res) => {
  const { name, email, password, upi_id } = req.body;
  try {
    await registerUser(name, email, password, upi_id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  if (!result) return res.status(400).json({ error: "Invalid credentials" });
  res.json(result);
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

// Watch ad (call only when video ends)
app.post("/watch/:adId", authMiddleware, async (req, res) => {
  try {
    const reward = await watchAd(req.user.id, req.params.adId);
    res.json({ reward });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get balance
app.get("/balance", authMiddleware, async (req, res) => {
  try {
    const data = await getUserBalance(req.user.id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Withdraw with 60%-40% split, min ₹1
app.post("/withdraw", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < 1) return res.status(400).json({ error: "Minimum ₹1 required" });

    const userShare = parseFloat((user.balance * 0.4).toFixed(2));
    const adminShare = parseFloat((user.balance * 0.6).toFixed(2));

    // Reset balance after withdraw
    await db.run("UPDATE users SET balance = 0 WHERE id = ?", [userId]);

    res.json({
      message: `Withdrawal processed (simulated). Admin gets ₹${adminShare}, you get ₹${userShare}.`,
      user_share: userShare,
      admin_share: adminShare,
      user_balance: 0
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
