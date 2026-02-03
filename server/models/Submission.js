const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    enrollment_id: { type: mongoose.Schema.Types.ObjectId },
    submission_date: { type: Date },
    submission_content: { type: Object },
    status: { type: String, default: "submitted" },
    score: { type: Number },
    feedback: { type: String },
    graded_by: { type: mongoose.Schema.Types.ObjectId },
    graded_date: { type: Date },
    attempt_number: { type: Number },
    time_spent_minutes: { type: Number }
  },
  {
    timestamps: false,
    strict: false,
    collection: "submissions"
  }
);

submissionSchema.index({ assignment_id: 1 });
submissionSchema.index({ user_id: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
