const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    lesson_id: { type: String },
    title: { type: String },
    description: { type: String },
    instructions: { type: Array },
    max_score: { type: Number },
    due_date: { type: Date },
    type: { type: String },
    difficulty: { type: String },
    estimated_time_minutes: { type: Number },
    starter_code: { type: String },
    test_cases: { type: Array },
    rubric: { type: Array },
    submissions_count: { type: Number, default: 0 },
    average_score: { type: Number, default: 0 }
  },
  {
    timestamps: false,
    strict: false,
    collection: "assignments"
  }
);

assignmentSchema.index({ course_id: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
