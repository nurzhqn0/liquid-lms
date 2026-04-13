const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user_name: { type: String },
    user_avatar: { type: String },
    rating: { type: Number },
    title: { type: String },
    comment: { type: String },
    review_date: { type: Date, default: Date.now },
    verified_purchase: { type: Boolean, default: false },
    completion_status: { type: String },
    completion_percentage: { type: Number },
    helpful_count: { type: Number, default: 0 },
    reported: { type: Boolean, default: false },
    instructor_response: { type: Object }
  },
  {
    timestamps: false,
    strict: false,
    collection: "reviews"
  }
);

reviewSchema.index({ course_id: 1 });
reviewSchema.index({ user_id: 1 });

module.exports = mongoose.model("Review", reviewSchema);
