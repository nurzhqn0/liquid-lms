const mongoose = require("mongoose");
const env = require("./config/env");

async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, {
    autoIndex: false
  });
  console.log("Connected to MongoDB");
}

function getDbStatus() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  const readyState = mongoose.connection.readyState;

  return {
    ready: readyState === 1,
    readyState,
    status: states[readyState] || "unknown"
  };
}

module.exports = { connectDb, getDbStatus };
