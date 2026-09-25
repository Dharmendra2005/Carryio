const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const connectDB = require("./config/database");

// Middlewares (Stages 7 & 8)
const requestLogger = require("./middleware/requestLogger");
const metricsMiddleware = require("./middleware/metricsMiddleware");
const { helmetMiddleware, sanitizeInputs } = require("./middleware/security");
const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

// Metrics Utility
const metricsRegistry = require("./utils/metrics");

// Modular Routers
const authRoutes = require("./modules/auth/auth.routes");
const shipmentRoutes = require("./modules/shipment/shipment.routes");
const paymentRoutes = require("./modules/payment/payment.routes");

// Legacy Routers for full backward compatibility
const addressRouter = require("./routes/addressRouter");
const orderRouter = require("./routes/orderRouter");
const userRouter = require("./routes/roleRouter/userRouter");
const cartRouter = require("./routes/cartRouter");
const managerRouter = require("./routes/roleRouter/managerRouter");
const productRouter = require("./routes/productRouter");
const rezopayRouter = require("./routes/rezopayRouter");

const app = express();

// Database Connection
connectDB();

// Security Headers (Helmet)
app.use(helmetMiddleware);

// Request Logging & Telemetry Metrics (Stage 7 - Observability)
app.use(requestLogger);
app.use(metricsMiddleware);

// Body Parser Middleware (with rawBody support for Webhook Signature Verification)
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// Injection Protection (NoSQL Sanitization)
app.use(sanitizeInputs);

// CORS Configuration
app.use(
  cors({
    origin: [
      "https://carryio-gfeb.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

// Global Rate Limiter Middleware
app.use(rateLimiter(200, 900));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    metrics: metricsRegistry.getMetricsSummary(),
  });
});

// Telemetry & Metrics Route for Prometheus (Stage 7 - Observability)
app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(metricsRegistry.getPrometheusFormat());
});

// Direct Root Aliases for Login and Logout (Full Backward & Legacy Compatibility)
const authController = require("./modules/auth/auth.controller");
const authMiddleware = require("./middleware/auth");
app.post("/login", authController.login);
app.post("/logout", authMiddleware, authController.logout);

// Mounted v1 Modular Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Legacy Route Aliases
app.use("/users", userRouter);
app.use("/manager", managerRouter);
app.use("/products", productRouter);
app.use("/addresses", addressRouter);
app.use("/orders", orderRouter);
app.use("/cart", cartRouter);
app.use("/payment", rezopayRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
