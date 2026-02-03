const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { getAuthCookieOptions } = require("../utils/cookies");

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeUser(user) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name
  };
}

router.post("/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: "Identifier and password are required" });
    }

    const escaped = escapeRegex(String(identifier).trim());
    const identifierRegex = new RegExp(`^${escaped}$`, "i");

    const user = await User.findOne({
      $or: [{ email: identifierRegex }, { username: identifierRegex }]
    });

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn
    });

    res.cookie("token", token, getAuthCookieOptions());
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", getAuthCookieOptions());
  return res.json({ ok: true });
});

router.get("/me", auth, (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

module.exports = router;
