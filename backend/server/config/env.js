const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  enrollmentsCollection: process.env.ENROLLMENTS_COLLECTION || "enrollments",
  cookieSecure:
    process.env.COOKIE_SECURE === undefined
      ? process.env.NODE_ENV === "production"
      : process.env.COOKIE_SECURE === "true"
};

if (!env.mongoUri) {
  console.warn("MONGO_URI is not set. The server will fail to connect.");
}

module.exports = env;
