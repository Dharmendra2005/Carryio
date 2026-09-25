const { validateStateTransition, SHIPMENT_STATUSES } = require("./modules/shipment/shipment.validation");
const metricsRegistry = require("./utils/metrics");
const authorizeRoles = require("./middleware/rbac");

console.log("=== CARRYIO STAGES 6, 7, 8 ARCHITECTURE VERIFICATION ===");

// 1. Verify Stage 6 Shipment Status Machine Transitions
console.log("\n1. Testing Stage 6 Shipment Status Machine:");
const testTransitions = [
  { from: "ORDER_PLACED", to: "PACKED", expected: true },
  { from: "PACKED", to: "PICKED_UP", expected: true },
  { from: "PICKED_UP", to: "IN_TRANSIT", expected: true },
  { from: "IN_TRANSIT", to: "ARRIVED_AT_HUB", expected: true },
  { from: "ARRIVED_AT_HUB", to: "OUT_FOR_DELIVERY", expected: true },
  { from: "OUT_FOR_DELIVERY", to: "DELIVERED", expected: true },
  { from: "ORDER_PLACED", to: "DELIVERED", expected: false }, // Invalid skip
  { from: "DELIVERED", to: "PACKED", expected: false }, // Final state
];

testTransitions.forEach(({ from, to, expected }) => {
  const result = validateStateTransition(from, to, false);
  const pass = result.valid === expected;
  console.log(` - Transition ${from} -> ${to}: ${pass ? "✅ PASS" : "❌ FAIL"} (${result.valid ? "Allowed" : result.message})`);
});

// 2. Verify Observability Metrics Endpoint (Stage 7)
console.log("\n2. Testing Stage 7 Observability & Telemetry Endpoint:");
metricsRegistry.recordRequest("GET", "/api/v1/shipments/track/CRY-123", 200, 45);
metricsRegistry.recordRequest("POST", "/api/v1/auth/login", 401, 120);
metricsRegistry.recordDbQuery(12.5);
metricsRegistry.recordCacheHit();
metricsRegistry.recordCacheMiss();

const metricsSummary = metricsRegistry.getMetricsSummary();
console.log(" - Metrics Summary:", JSON.stringify(metricsSummary, null, 2));

const prometheusFormat = metricsRegistry.getPrometheusFormat();
if (prometheusFormat.includes("http_requests_total") && prometheusFormat.includes("http_errors_total")) {
  console.log(" ✅ Prometheus format generation verified!");
} else {
  console.log(" ❌ Prometheus format error");
}

// 3. Verify Security & RBAC Roles (Stage 8)
console.log("\n3. Testing Stage 8 Security & Roles:");
const mockReq = { user: { role: "CUSTOMER" } };
const mockRes = {
  status: (code) => ({
    json: (data) => console.log(` - Role Check Result (Status ${code}):`, data.message),
  }),
};
const mockNext = () => console.log(" - Role Check Passed: User granted access ✅");

console.log(" - Checking CUSTOMER accessing CUSTOMER endpoint:");
authorizeRoles("CUSTOMER")(mockReq, mockRes, mockNext);

console.log(" - Checking CUSTOMER accessing ADMIN endpoint:");
authorizeRoles("ADMIN")(mockReq, mockRes, mockNext);

console.log("\n=== ALL STAGE 6, 7 & 8 TESTS COMPLETE ===");
