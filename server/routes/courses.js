const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  computeModuleStats,
  updateCourseEnrollmentStats
} = require("../utils/courseStats");

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

router.post("/", auth, requireRole("instructor"), async (req, res, next) => {
  try {
    const { title, slug } = req.body || {};
    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const instructorName =
      req.body?.instructor_name ||
      [req.user.first_name, req.user.last_name].filter(Boolean).join(" ") ||
      req.user.username;

    const modules = Array.isArray(req.body?.modules) ? req.body.modules : [];
    const moduleStats = computeModuleStats(modules);

    const payload = {
      ...req.body,
      title,
      slug,
      instructor_id: req.user._id,
      instructor_name: instructorName,
      created_at: new Date(),
      updated_at: new Date(),
      statistics: {
        total_modules: moduleStats.total_modules,
        total_lessons: moduleStats.total_lessons,
        total_duration_minutes: moduleStats.total_duration_minutes,
        total_enrollments: 0,
        active_students: 0,
        completion_rate: 0
      },
      ratings: {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {
          "5_star": 0,
          "4_star": 0,
          "3_star": 0,
          "2_star": 0,
          "1_star": 0
        }
      }
    };

    const course = await Course.create(payload);
    return res.status(201).json({ course });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Course already exists" });
    }
    return next(err);
  }
});

router.patch("/:id", auth, requireRole("instructor"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Course not found" });
    }

    const course = await Course.findById(id).lean();
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.instructor_id && String(course.instructor_id) !== String(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.instructor_id;
    delete updates.statistics;
    delete updates.ratings;
    delete updates.created_at;

    const setDoc = { ...updates, updated_at: new Date() };

    if (Object.prototype.hasOwnProperty.call(updates, "modules")) {
      const moduleStats = computeModuleStats(updates.modules);
      setDoc["statistics.total_modules"] = moduleStats.total_modules;
      setDoc["statistics.total_lessons"] = moduleStats.total_lessons;
      setDoc["statistics.total_duration_minutes"] = moduleStats.total_duration_minutes;
    }

    const updated = await Course.findByIdAndUpdate(id, { $set: setDoc }, { new: true, runValidators: true }).lean();
    return res.json({ course: updated });
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
      ...req.body,
      user_id: req.user._id,
      course_id: id,
      course_title: course.title,
      instructor_name: course.instructor_name,
      status: "active",
      completion_percentage: req.body?.completion_percentage ?? 0,
      progress: Array.isArray(req.body?.progress) ? req.body.progress : [],
      enrollment_date: new Date(),
      last_accessed: new Date()
    });

    await updateCourseEnrollmentStats(id);
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

    await updateCourseEnrollmentStats(id);
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
