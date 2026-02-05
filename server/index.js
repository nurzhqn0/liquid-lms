const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const env = require("./config/env");
const { swaggerSpec } = require("./config/swagger");
const { connectDb } = require("./db");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const enrollmentRoutes = require("./routes/enrollments");
const assignmentRoutes = require("./routes/assignments");
const submissionRoutes = require("./routes/submissions");
const reviewRoutes = require("./routes/reviews");
const errorHandler = require("./middleware/error");

const app = express();

function getAllowedOrigins() {
  const origins = new Set();
  if (env.clientOrigin) {
    env.clientOrigin
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
      .forEach((origin) => origins.add(origin));
  }
  origins.add(`http://localhost:${env.port}`);
  origins.add(`http://127.0.0.1:${env.port}`);
  return Array.from(origins);
}

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const allowedOrigins = getAllowedOrigins();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

const head = "";

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use(`${head}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get(`${head}/docs.json`, (req, res) => {
  res.json(swaggerSpec);
});

app.use(`${head}/auth`, authRoutes);
app.use(`${head}/courses`, courseRoutes);
app.use(`${head}/enrollments`, enrollmentRoutes);
app.use(`${head}`, assignmentRoutes);
app.use(`${head}`, submissionRoutes);
app.use(`${head}`, reviewRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
