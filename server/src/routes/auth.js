import express from "express";
import { login, logout, onboard, signup } from "../controller/auth.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// middleware
router.post("/signup", signup)
router.post("/login", login);
router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);

// In the future you might decide to add other routes like,
// forget-password
// send-reset-password-email (or just) reset-password

// Check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ user: req.userDetails });
});

export default router;