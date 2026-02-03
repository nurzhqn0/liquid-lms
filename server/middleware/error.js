function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = err.message || "Server error";
  return res.status(status).json({ error: message });
}

module.exports = errorHandler;
