const express = require("express");
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");
const Submission = require("../models/Submission");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

router.post("/assignments/:id/submissions", auth, requireRole("student"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const assignment = await Assignment.findById(id).lean();
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const enrollment = await Enrollment.findOne({
      user_id: req.user._id,
      course_id: assignment.course_id
    }).lean();

    const payload = {
      assignment_id: id,
      user_id: req.user._id,
      enrollment_id: enrollment ? enrollment._id : undefined,
      submission_date: new Date(),
      submission_content: req.body?.submission_content,
      attempt_number: req.body?.attempt_number,
      time_spent_minutes: req.body?.time_spent_minutes,
      status: "submitted"
    };

    const submission = await Submission.create(payload);
    return res.status(201).json({ submission });
  } catch (err) {
    return next(err);
  }
});

router.get("/assignments/:id/submissions", auth, requireRole("instructor"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const submissions = await Submission.find({ assignment_id: id })
      .sort({ submission_date: -1 })
      .lean();
    return res.json({ submissions });
  } catch (err) {
    return next(err);
  }
});

router.get("/submissions/me", auth, requireRole("student"), async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user_id: req.user._id })
      .sort({ submission_date: -1 })
      .lean();
    return res.json({ submissions });
  } catch (err) {
    return next(err);
  }
});

router.patch("/submissions/:id", auth, requireRole("instructor"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const updates = { ...req.body };
    delete updates.assignment_id;
    delete updates.user_id;
    delete updates.enrollment_id;
    delete updates.submission_date;

    if (updates.score !== undefined || updates.feedback !== undefined || updates.status === "graded") {
      updates.graded_by = req.user._id;
      updates.graded_date = updates.graded_date || new Date();
      updates.status = updates.status || "graded";
    }

    const submission = await Submission.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    return res.json({ submission });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
