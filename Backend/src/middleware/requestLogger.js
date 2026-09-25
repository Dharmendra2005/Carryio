const { v4: uuidv4 } = require("crypto");

/**
 * Structured Logging Middleware (Stage 7 - Observability)
 * Captures Request ID, User ID, Shipment ID, Endpoint, Status Code, Latency, and Errors.
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Assign or preserve Request ID
  const requestId = req.headers["x-request-id"] || (crypto && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.floor(Math.random() * 10000)}`);
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  // Capture response finish event
  res.on("finish", () => {
    const latency = Date.now() - startTime;
    const userId = req.user?.id || req.user?._id || "anonymous";
    const shipmentId = req.params?.shipmentId || req.params?.id || req.body?.shipmentId || "N/A";
    const endpoint = `${req.method} ${req.originalUrl || req.url}`;
    const statusCode = res.statusCode;
    const error = res.errorDetails || (statusCode >= 400 ? res.statusMessage || "HTTP Error" : null);

    const logPayload = {
      timestamp: new Date().toISOString(),
      requestId,
      userId,
      shipmentId,
      endpoint,
      statusCode,
      latencyMs: latency,
      error: error || undefined,
    };

    if (statusCode >= 500) {
      console.error(`[HTTP] 🔴 ${JSON.stringify(logPayload)}`);
    } else if (statusCode >= 400) {
      console.warn(`[HTTP] 🟡 ${JSON.stringify(logPayload)}`);
    } else {
      console.log(`[HTTP] 🟢 ${JSON.stringify(logPayload)}`);
    }
  });

  next();
};

module.exports = requestLogger;
