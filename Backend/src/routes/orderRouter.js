const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/manager/all",
  authMiddleware.authMiddleware,
  orderController.getAllOrders,
);
router.post("/", authMiddleware.authMiddleware, orderController.createOrder);
router.get("/", authMiddleware.authMiddleware, orderController.getMyOrders);
router.patch(
  "/:id/status",
  authMiddleware.authMiddleware,
  orderController.updateOrderStatus,
);

module.exports = router;
