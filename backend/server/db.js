const mongoose = require("mongoose");
const env = require("./config/env");

async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, {
    autoIndex: false
  });
  console.log("Connected to MongoDB");
}

module.exports = { connectDb };
