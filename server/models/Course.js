const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String },
    slug: { type: String },
    description: { type: String },
    instructor_id: { type: mongoose.Schema.Types.ObjectId },
    modules: { type: Array }
  },
  {
    timestamps: false,
    strict: false,
    collection: "courses"
  }
);

module.exports = mongoose.model("Course", courseSchema);
