import 'dotenv/config';
import express from "express";
import cors from "cors";
import { initDB } from "./db.js";
import { 
  registerUser, 
  loginUser, 
  getAds, 
  watchAd, 
  getUserBalance, 
  sendPayout 
} from "./queries.js";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "supersecretkey";

// ---------------------- AUTH MIDDLEWARE ---------------------- //
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

// ---------------------- ROUTES ---------------------- //
app.post("/register", async (req, res) => {
  const { name, email, password, upi_id } = req.body;
  try {
    await registerUser(name, email, password, upi_id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await loginUser(email, password);
    if (!result) return res.status(400).json({ error: "Invalid credentials" });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/ads", authMiddleware, async (req, res) => {
  try {
    const ads = await getAds();
    res.json(ads);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/watch/:adId", authMiddleware, async (req, res) => {
  try {
    const reward = await watchAd(req.user.id, req.params.adId);
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
    const payout = await sendPayout(req.user.id, req.body.upi_id);
    res.json(payout);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---------------------- START SERVER ---------------------- //
const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
