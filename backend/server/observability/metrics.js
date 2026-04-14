const client = require("prom-client");

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: "liquid_lms_node_"
});

const httpRequestsTotal = new client.Counter({
  name: "liquid_lms_http_requests_total",
  help: "Total HTTP requests handled by the backend.",
  labelNames: ["method", "route", "status"],
  registers: [register]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "liquid_lms_http_request_duration_seconds",
  help: "HTTP request duration in seconds.",
  labelNames: ["method", "route", "status"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [register]
});

const businessOperationsTotal = new client.Counter({
  name: "liquid_lms_business_operations_total",
  help: "Eligible LMS business operations tracked for SLI reporting.",
  labelNames: ["operation", "outcome"],
  registers: [register]
});

function sanitizePath(pathValue) {
  if (!pathValue) {
    return "unknown";
  }

  const [pathname] = String(pathValue).split("?");
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      if (/^[a-f\d]{24}$/i.test(segment) || /^\d+$/.test(segment)) {
        return ":id";
      }
      return segment;
    })
    .join("/")
    .replace(/^/, "/");
}

function normalizeRoute(req) {
  if (req.route && typeof req.route.path === "string") {
    const baseUrl = req.baseUrl || "";
    if (!baseUrl) {
      return req.route.path;
    }
    if (req.route.path === "/") {
      return baseUrl;
    }
    return `${baseUrl}${req.route.path}`;
  }

  return sanitizePath(req.path || req.originalUrl || "unknown");
}

function metricsMiddleware(req, res, next) {
  if (req.path === "/metrics") {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const route = normalizeRoute(req);
    const status = String(res.statusCode);
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    const labels = {
      method: req.method,
      route,
      status
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });

  return next();
}

function recordBusinessOperation(operation, outcome) {
  businessOperationsTotal.inc({ operation, outcome });
}

module.exports = {
  register,
  metricsMiddleware,
  recordBusinessOperation
};
