const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Review = require("../models/Review");

function computeModuleStats(modules) {
  if (!Array.isArray(modules)) {
    return { total_modules: 0, total_lessons: 0, total_duration_minutes: 0 };
  }

  let totalLessons = 0;
  let totalDuration = 0;

  modules.forEach((moduleItem) => {
    const lessons = Array.isArray(moduleItem.lessons) ? moduleItem.lessons : [];
    totalLessons += lessons.length;

    let moduleLessonDuration = 0;
    lessons.forEach((lesson) => {
      if (typeof lesson.duration_minutes === "number") {
        moduleLessonDuration += lesson.duration_minutes;
      }
    });

    if (moduleLessonDuration > 0) {
      totalDuration += moduleLessonDuration;
    } else if (typeof moduleItem.duration_minutes === "number") {
      totalDuration += moduleItem.duration_minutes;
    }
  });

  return {
    total_modules: modules.length,
    total_lessons: totalLessons,
    total_duration_minutes: totalDuration
  };
}

async function updateCourseModuleStats(courseId, modulesOverride) {
  const courseObjectId = new mongoose.Types.ObjectId(courseId);
  let modules = modulesOverride;

  if (!modules) {
    const course = await Course.findById(courseObjectId).lean();
    modules = course ? course.modules : [];
  }

  const stats = computeModuleStats(modules);
  await Course.updateOne(
    { _id: courseObjectId },
    {
      $set: {
        "statistics.total_modules": stats.total_modules,
        "statistics.total_lessons": stats.total_lessons,
        "statistics.total_duration_minutes": stats.total_duration_minutes
      }
    }
  );
}

async function updateCourseEnrollmentStats(courseId) {
  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  const totalEnrollments = await Enrollment.countDocuments({ course_id: courseObjectId });
  const activeStudents = await Enrollment.countDocuments({
    course_id: courseObjectId,
    status: "active"
  });

  const avgAgg = await Enrollment.aggregate([
    { $match: { course_id: courseObjectId, completion_percentage: { $type: "number" } } },
    { $group: { _id: null, avg_completion: { $avg: "$completion_percentage" } } }
  ]);

  let completionRate = avgAgg.length ? avgAgg[0].avg_completion : 0;
  if (completionRate > 1) {
    completionRate = completionRate / 100;
  }

  await Course.updateOne(
    { _id: courseObjectId },
    {
      $set: {
        "statistics.total_enrollments": totalEnrollments,
        "statistics.active_students": activeStudents,
        "statistics.completion_rate": completionRate
      }
    }
  );
}

async function updateCourseRatings(courseId) {
  const courseObjectId = new mongoose.Types.ObjectId(courseId);
  const reviews = await Review.find({ course_id: courseObjectId }).lean();

  const distribution = {
    "5_star": 0,
    "4_star": 0,
    "3_star": 0,
    "2_star": 0,
    "1_star": 0
  };

  let totalRating = 0;
  let totalReviews = 0;

  reviews.forEach((review) => {
    const rating = Number(review.rating);
    if (Number.isFinite(rating) && rating >= 1 && rating <= 5) {
      totalReviews += 1;
      totalRating += rating;
      const key = `${Math.round(rating)}_star`;
      if (distribution[key] !== undefined) {
        distribution[key] += 1;
      }
    }
  });

  const averageRating = totalReviews ? totalRating / totalReviews : 0;

  await Course.updateOne(
    { _id: courseObjectId },
    {
      $set: {
        "ratings.average_rating": averageRating,
        "ratings.total_reviews": totalReviews,
        "ratings.rating_distribution": distribution
      }
    }
  );
}

module.exports = {
  computeModuleStats,
  updateCourseModuleStats,
  updateCourseEnrollmentStats,
  updateCourseRatings
};
