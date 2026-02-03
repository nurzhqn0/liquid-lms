const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { getAuthCookieOptions } = require("../utils/cookies");

const router = express.Router();
const SALT_ROUNDS = 10;

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

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name, role } = req.body || {};

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    const safeRole = role === "instructor" || role === "student" ? role : "student";
    const usernameRegex = new RegExp(`^${escapeRegex(String(username).trim())}$`, "i");
    const emailRegex = new RegExp(`^${escapeRegex(String(email).trim())}$`, "i");

    const existing = await User.findOne({
      $or: [{ email: emailRegex }, { username: usernameRegex }]
    }).lean();

    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      username: String(username).trim(),
      email: String(email).trim(),
      password_hash,
      first_name: first_name ? String(first_name).trim() : undefined,
      last_name: last_name ? String(last_name).trim() : undefined,
      role: safeRole
    });

    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn
    });

    res.cookie("token", token, getAuthCookieOptions());
    return res.status(201).json({ user: sanitizeUser(user) });
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
