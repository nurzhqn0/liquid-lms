const express = require("express");
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");
const Submission = require("../models/Submission");
const User = require("../models/User");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

async function recomputeAssignmentStats(assignmentId) {
  const assignmentObjectId = new mongoose.Types.ObjectId(assignmentId);
  const submissionsCount = await Submission.countDocuments({ assignment_id: assignmentObjectId });
  const avgAgg = await Submission.aggregate([
    { $match: { assignment_id: assignmentObjectId, score: { $type: "number" } } },
    { $group: { _id: null, average_score: { $avg: "$score" } } }
  ]);
  const averageScore = avgAgg.length ? avgAgg[0].average_score : 0;
  await Assignment.updateOne(
    { _id: assignmentObjectId },
    { $set: { submissions_count: submissionsCount, average_score: averageScore } }
  );
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

    const userName =
      req.user.first_name || req.user.last_name
        ? [req.user.first_name, req.user.last_name].filter(Boolean).join(" ")
        : req.user.username;

    const payload = {
      assignment_id: id,
      user_id: req.user._id,
      user_name: userName,
      user_avatar: req.user.profile_picture,
      enrollment_id: enrollment ? enrollment._id : undefined,
      submission_date: new Date(),
      submission_content: req.body?.submission_content,
      attempt_number: req.body?.attempt_number,
      time_spent_minutes: req.body?.time_spent_minutes,
      status: "submitted"
    };

    const submission = await Submission.create(payload);
    await recomputeAssignmentStats(assignment._id);
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

    const missingUserIds = submissions
      .filter((submission) => !submission.user_name)
      .map((submission) => submission.user_id)
      .filter(Boolean);

    if (missingUserIds.length) {
      const users = await User.find({ _id: { $in: missingUserIds } }).lean();
      const userMap = users.reduce((acc, user) => {
        const name =
          user.first_name || user.last_name
            ? [user.first_name, user.last_name].filter(Boolean).join(" ")
            : user.username;
        acc[String(user._id)] = {
          user_name: name,
          user_avatar: user.profile_picture
        };
        return acc;
      }, {});

      submissions.forEach((submission) => {
        const meta = userMap[String(submission.user_id)];
        if (meta) {
          submission.user_name = meta.user_name;
          submission.user_avatar = meta.user_avatar;
        }
      });
    }

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
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "score")) {
      await recomputeAssignmentStats(submission.assignment_id);
    }
    return res.json({ submission });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
