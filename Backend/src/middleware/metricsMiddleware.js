const metricsRegistry = require("../utils/metrics");

/**
 * Middleware to record HTTP metrics for Prometheus monitoring
 */
const metricsMiddleware = (req, res, next) => {
  if (req.path === "/metrics") return next(); // Exclude /metrics path itself from metric counts

  const startTime = Date.now();

  res.on("finish", () => {
    const latencyMs = Date.now() - startTime;
    const route = req.route ? req.route.path : req.path;
    metricsRegistry.recordRequest(req.method, route, res.statusCode, latencyMs);
  });

  next();
};

module.exports = metricsMiddleware;
