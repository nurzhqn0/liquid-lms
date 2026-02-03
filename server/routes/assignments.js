const express = require("express");
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

router.get("/courses/:id/assignments", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Course not found" });
    }
    const assignments = await Assignment.find({ course_id: id }).lean();
    return res.json({ assignments });
  } catch (err) {
    return next(err);
  }
});

router.post("/courses/:id/assignments", auth, requireRole("instructor"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Course not found" });
    }

    const course = await Course.findById(id).lean();
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const payload = { ...req.body, course_id: id };
    if (!payload.title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const assignment = await Assignment.create(payload);
    return res.status(201).json({ assignment });
  } catch (err) {
    return next(err);
  }
});

router.get("/assignments/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    const assignment = await Assignment.findById(id).lean();
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    return res.json({ assignment });
  } catch (err) {
    return next(err);
  }
});

router.patch("/assignments/:id", auth, requireRole("instructor"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    const updates = { ...req.body };
    delete updates.course_id;
    delete updates._id;

    const assignment = await Assignment.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    return res.json({ assignment });
  } catch (err) {
    return next(err);
  }
});

router.delete("/assignments/:id", auth, requireRole("instructor"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    const assignment = await Assignment.findByIdAndDelete(id).lean();
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
