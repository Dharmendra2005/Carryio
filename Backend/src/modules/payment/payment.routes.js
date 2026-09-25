const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const authMiddleware = require("../../middleware/auth");

router.post("/create-order", authMiddleware, paymentController.createPaymentOrder);
router.post("/verify", authMiddleware, paymentController.verifyPayment);
router.post("/webhook", paymentController.handleRazorpayWebhook);

module.exports = router;
