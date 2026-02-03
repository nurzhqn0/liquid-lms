const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String },
    password_hash: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    role: { type: String }
  },
  {
    timestamps: false,
    strict: false,
    collection: "users"
  }
);

module.exports = mongoose.model("User", userSchema);
