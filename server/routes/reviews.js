const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

router.get("/courses/:id/reviews", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Course not found" });
    }
    const reviews = await Review.find({ course_id: id }).sort({ review_date: -1 }).lean();
    return res.json({ reviews });
  } catch (err) {
    return next(err);
  }
});

router.post("/courses/:id/reviews", auth, requireRole("student"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Course not found" });
    }

    const course = await Course.findById(id).lean();
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const { rating, title, comment } = req.body || {};
    if (rating === undefined) {
      return res.status(400).json({ error: "Rating is required" });
    }

    const review = await Review.create({
      course_id: id,
      user_id: req.user._id,
      rating,
      title,
      comment,
      review_date: new Date()
    });

    return res.status(201).json({ review });
  } catch (err) {
    return next(err);
  }
});

router.delete("/reviews/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = await Review.findById(id).lean();
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const isOwner = String(review.user_id) === String(req.user._id);
    const isInstructor = req.user.role === "instructor";
    if (!isOwner && !isInstructor) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await Review.deleteOne({ _id: id });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
