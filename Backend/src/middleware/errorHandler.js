const errorHandler = (err, req, res, next) => {
  console.error("[Global Error Handler]", err);

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
