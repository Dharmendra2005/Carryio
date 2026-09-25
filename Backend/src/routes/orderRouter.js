const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get(
  "/manager/all",
  authMiddleware,
  orderController.getAllOrders,
);
router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getMyOrders);
router.patch(
  "/:id/status",
  authMiddleware,
  orderController.updateOrderStatus,
);

module.exports = router;
