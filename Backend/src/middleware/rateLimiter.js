const redis = require("../config/redis");

const rateLimiter = (maxRequests = 100, windowSeconds = 900) => {
  return async (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const key = `rate_limit:${req.baseUrl || ""}:${ip}`;

    try {
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= maxRequests) {
        res.setHeader("Retry-After", windowSeconds);
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          limit: maxRequests,
          retryAfterSeconds: windowSeconds,
        });
      }

      await redis.set(key, count + 1, "EX", windowSeconds);
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - (count + 1)));

      next();
    } catch (err) {
      // Gracefully continue on error
      next();
    }
  };
};

module.exports = rateLimiter;
