const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.authMiddleware, orderController.createOrder);
router.get("/", authMiddleware.authMiddleware, orderController.getMyOrders);

module.exports = router;
