const env = require("../config/env");

function getAuthCookieOptions() {
  const secure = env.cookieSecure;
  return {
    httpOnly: true,
    sameSite: secure ? "none" : "lax",
    secure,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

module.exports = { getAuthCookieOptions };
