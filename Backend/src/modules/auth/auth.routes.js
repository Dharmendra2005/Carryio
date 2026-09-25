const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authMiddleware = require("../../middleware/auth");
const rateLimiter = require("../../middleware/rateLimiter");

router.post("/register", rateLimiter(10, 900), authController.register);
router.post("/login", rateLimiter(10, 900), authController.login);
router.post("/refresh", rateLimiter(30, 900), authController.refresh);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getProfile);

module.exports = router;
