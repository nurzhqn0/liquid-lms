const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

router.get("/", async (req, res, next) => {
  try {
    const courses = await Course.find({}).lean();
    return res.json({ courses });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Course not found" });
    }
    const course = await Course.findById(id).lean();
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.json({ course });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/enroll", auth, requireRole("student"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Course not found" });
    }

    const course = await Course.findById(id).lean();
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const existing = await Enrollment.findOne({
      user_id: req.user._id,
      course_id: id
    });

    if (existing) {
      return res.status(409).json({ error: "Already enrolled" });
    }

    const enrollment = await Enrollment.create({
      user_id: req.user._id,
      course_id: id,
      status: "active",
      completion_percentage: 0,
      progress: [],
      enrollment_date: new Date()
    });

    return res.status(201).json({ enrollment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Already enrolled" });
    }
    return next(err);
  }
});

router.delete("/:id/enroll", auth, requireRole("student"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Course not found" });
    }

    const result = await Enrollment.findOneAndDelete({
      user_id: req.user._id,
      course_id: id
    });

    if (!result) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
