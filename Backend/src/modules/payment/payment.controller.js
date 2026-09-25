const paymentService = require("./payment.service");
const { successResponse, errorResponse } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;
  if (!amount) {
    return errorResponse(res, 400, "amount is required");
  }

  const userId = req.user ? req.user.id : null;
  const result = await paymentService.createRazorpayOrder(amount, orderId, userId);
  return res.status(201).json(result.razorpayOrder);
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return errorResponse(res, 400, "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required");
  }

  const result = await paymentService.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  );

  return successResponse(res, 200, "Payment verified successfully", result);
});

const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signatureHeader = req.headers["x-razorpay-signature"];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const result = await paymentService.processWebhook(rawBody, signatureHeader, req.body);
  return res.status(200).json(result);
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleRazorpayWebhook,
};
