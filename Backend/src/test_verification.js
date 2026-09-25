const { validateStateTransition, SHIPMENT_STATUSES } = require("./modules/shipment/shipment.validation");
const paymentService = require("./modules/payment/payment.service");
const redis = require("./config/redis");
const crypto = require("crypto");

async function runVerification() {
  console.log("==========================================");
  console.log("  CARRYIO BACKEND VERIFICATION SUITE      ");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Shipment FSM Tests
  console.log("\n--- Stage 2: Shipment FSM Tests ---");

  const valid1 = validateStateTransition(SHIPMENT_STATUSES.ORDER_PLACED, SHIPMENT_STATUSES.PACKED);
  assert(valid1.valid === true, "FSM: ORDER_PLACED -> PACKED should be valid");

  const valid2 = validateStateTransition(SHIPMENT_STATUSES.PACKED, SHIPMENT_STATUSES.SHIPPED);
  assert(valid2.valid === true, "FSM: PACKED -> SHIPPED should be valid");

  const valid3 = validateStateTransition(SHIPMENT_STATUSES.SHIPPED, SHIPMENT_STATUSES.OUT_FOR_DELIVERY);
  assert(valid3.valid === true, "FSM: SHIPPED -> OUT_FOR_DELIVERY should be valid");

  const valid4 = validateStateTransition(SHIPMENT_STATUSES.OUT_FOR_DELIVERY, SHIPMENT_STATUSES.DELIVERED);
  assert(valid4.valid === true, "FSM: OUT_FOR_DELIVERY -> DELIVERED should be valid");

  const invalidJump = validateStateTransition(SHIPMENT_STATUSES.ORDER_PLACED, SHIPMENT_STATUSES.SHIPPED);
  assert(invalidJump.valid === false, "FSM: Invalid jump ORDER_PLACED -> SHIPPED should be rejected");

  const terminalCheck = validateStateTransition(SHIPMENT_STATUSES.DELIVERED, SHIPMENT_STATUSES.PACKED);
  assert(terminalCheck.valid === false, "FSM: Transition from terminal DELIVERED status should be rejected");

  // 2. Razorpay Signature Verification Tests
  console.log("\n--- Stage 3: Razorpay Payment & Webhook Signature Tests ---");

  const testSecret = "qBCDv4lGuINIWTM3hVgrhvtM";
  process.env.RAZORPAY_KEY_SECRET = testSecret;

  const orderId = "order_123456";
  const paymentId = "pay_789012";
  const validSignature = crypto.createHmac("sha256", testSecret).update(`${orderId}|${paymentId}`).digest("hex");

  const clientVerifySuccess = paymentService.verifyClientSignature(orderId, paymentId, validSignature);
  assert(clientVerifySuccess === true, "Razorpay: Valid client signature should verify");

  const clientVerifyFail = paymentService.verifyClientSignature(orderId, paymentId, "invalid_sig_hash");
  assert(clientVerifyFail === false, "Razorpay: Invalid client signature should be rejected");

  const webhookSecret = "carryio_webhook_secret_key_12345";
  process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
  const rawBody = JSON.stringify({ event: "payment.captured", event_id: "evt_999" });
  const validWebhookSig = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  const webhookVerifySuccess = paymentService.verifyWebhookSignature(rawBody, validWebhookSig);
  assert(webhookVerifySuccess === true, "Webhook: Valid HMAC SHA256 webhook signature should verify");

  const webhookVerifyFail = paymentService.verifyWebhookSignature(rawBody, "bad_signature");
  assert(webhookVerifyFail === false, "Webhook: Invalid webhook signature should be rejected");

  // 3. Redis Store & Cache Tests
  console.log("\n--- Stage 4: Redis Cache & Fallback Tests ---");

  await redis.set("test_key", "test_val", "EX", 10);
  const val = await redis.get("test_key");
  assert(val === "test_val", "Redis Store: Set and Get operations should match");

  await redis.del("test_key");
  const clearedVal = await redis.get("test_key");
  assert(clearedVal === null, "Redis Store: Delete operation should clear key");

  console.log("\n==========================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
