const express = require("express");
const Enrollment = require("../models/Enrollment");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get("/me", auth, requireRole("student"), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user_id: req.user._id })
      .sort({ enrollment_date: -1 })
      .lean();
    return res.json({ enrollments });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
