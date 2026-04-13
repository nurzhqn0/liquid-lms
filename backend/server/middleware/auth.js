const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const { getAuthCookieOptions } = require("../utils/cookies");

async function auth(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).lean();
    if (!user) {
      res.clearCookie("token", getAuthCookieOptions());
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    return next();
  } catch (err) {
    res.clearCookie("token", getAuthCookieOptions());
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = auth;
