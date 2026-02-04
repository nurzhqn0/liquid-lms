const mongoose = require("mongoose");
const env = require("../config/env");

const enrollmentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    course_title: { type: String },
    instructor_name: { type: String },
    status: { type: String, default: "active" },
    payment_status: { type: String },
    amount_paid: { type: Number },
    payment_method: { type: String },
    completion_percentage: { type: Number, default: 0 },
    certificate_issued: { type: Boolean, default: false },
    certificate_url: { type: String },
    progress: { type: Array, default: [] },
    enrollment_date: { type: Date, default: Date.now },
    last_accessed: { type: Date, default: Date.now },
    total_time_spent_minutes: { type: Number, default: 0 },
    notes: { type: Array, default: [] },
    bookmarks: { type: Array, default: [] }
  },
  {
    timestamps: false,
    strict: false,
    collection: env.enrollmentsCollection
  }
);

enrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
