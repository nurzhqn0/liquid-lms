const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String },
    type: { type: String },
    url: { type: String }
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String },
    options: { type: Array },
    correct_answer: { type: Number }
  },
  { _id: false }
);

const quizDataSchema = new mongoose.Schema(
  {
    questions: { type: [quizQuestionSchema], default: [] },
    passing_score: { type: Number }
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    lesson_id: { type: String },
    title: { type: String },
    content_type: { type: String },
    content_url: { type: String },
    duration_minutes: { type: Number },
    order_number: { type: Number },
    is_preview: { type: Boolean },
    resources: { type: [resourceSchema], default: [] },
    quiz_data: { type: quizDataSchema }
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    module_id: { type: String },
    title: { type: String },
    description: { type: String },
    order_number: { type: Number },
    duration_minutes: { type: Number },
    lessons: { type: [lessonSchema], default: [] }
  },
  { _id: false }
);

const statisticsSchema = new mongoose.Schema(
  {
    total_modules: { type: Number, default: 0 },
    total_lessons: { type: Number, default: 0 },
    total_duration_minutes: { type: Number, default: 0 },
    total_enrollments: { type: Number, default: 0 },
    active_students: { type: Number, default: 0 },
    completion_rate: { type: Number, default: 0 }
  },
  { _id: false }
);

const ratingDistributionSchema = new mongoose.Schema(
  {
    "5_star": { type: Number, default: 0 },
    "4_star": { type: Number, default: 0 },
    "3_star": { type: Number, default: 0 },
    "2_star": { type: Number, default: 0 },
    "1_star": { type: Number, default: 0 }
  },
  { _id: false }
);

const ratingsSchema = new mongoose.Schema(
  {
    average_rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 },
    rating_distribution: { type: ratingDistributionSchema, default: () => ({}) }
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    instructor_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    instructor_name: { type: String },
    instructor_avatar: { type: String },
    category: { type: String },
    subcategory: { type: String },
    level: { type: String },
    language: { type: String },
    price: { type: Number },
    currency: { type: String },
    thumbnail: { type: String },
    preview_video: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_published: { type: Boolean, default: false },
    learning_objectives: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    modules: { type: [moduleSchema], default: [] },
    statistics: { type: statisticsSchema, default: () => ({}) },
    ratings: { type: ratingsSchema, default: () => ({}) },
    tags: { type: [String], default: [] }
  },
  {
    timestamps: false,
    strict: false,
    collection: "courses"
  }
);

courseSchema.index({ slug: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Course", courseSchema);
