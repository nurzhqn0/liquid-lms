const mongoose = require("mongoose");
const env = require("../config/env");

const enrollmentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, default: "active" },
    completion_percentage: { type: Number, default: 0 },
    progress: { type: Array, default: [] },
    enrollment_date: { type: Date, default: Date.now }
  },
  {
    timestamps: false,
    strict: false,
    collection: env.enrollmentsCollection
  }
);

enrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
