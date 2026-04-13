const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String },
    password_hash: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    role: { type: String },
    registration_date: { type: Date, default: Date.now },
    last_login: { type: Date, default: null },
    profile_picture: { type: String },
    bio: { type: String },
    social_links: { type: Object },
    preferences: { type: Object },
    statistics: { type: Object }
  },
  {
    timestamps: false,
    strict: false,
    collection: "users"
  }
);

module.exports = mongoose.model("User", userSchema);
