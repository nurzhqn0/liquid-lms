const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    rating: { type: Number },
    title: { type: String },
    comment: { type: String },
    review_date: { type: Date },
    verified_purchase: { type: Boolean }
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
