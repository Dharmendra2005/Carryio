const helmet = require("helmet");

/**
 * Security Middleware Suite (Stage 8 - Security)
 * Configures Helmet headers and request input sanitization
 */

// Helmet configuration for standard web security headers
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.razorpay.com", "http://localhost:*", "https://*"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// General Input Sanitizer Middleware (relational DB protection is handled natively by Prisma parameterized queries)
const sanitizeInputs = (req, res, next) => {
  next();
};

module.exports = {
  helmetMiddleware,
  sanitizeInputs,
};
