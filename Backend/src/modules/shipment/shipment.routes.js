const express = require("express");
const router = express.Router();
const shipmentController = require("./shipment.controller");
const authMiddleware = require("../../middleware/auth");
const authorizeRoles = require("../../middleware/rbac");

// Public / Customer track shipment by tracking number or order ID
router.get("/track/:identifier", shipmentController.trackShipment);

// Customer endpoints
router.post("/", authMiddleware, authorizeRoles("CUSTOMER", "ADMIN"), shipmentController.createShipment);
router.get("/my-shipments", authMiddleware, authorizeRoles("CUSTOMER", "ADMIN"), shipmentController.getMyShipments);
router.get("/order/:orderId", authMiddleware, shipmentController.getByOrder);

// Delivery Agent endpoints
router.get("/assigned", authMiddleware, authorizeRoles("DELIVERY_AGENT", "ADMIN"), shipmentController.getAssignedShipments);
router.patch("/:id/status", authMiddleware, authorizeRoles("DELIVERY_AGENT", "ADMIN"), shipmentController.updateStatus);

// Admin endpoints
router.get("/all", authMiddleware, authorizeRoles("ADMIN"), shipmentController.getAllShipments);
router.patch("/:id/assign", authMiddleware, authorizeRoles("ADMIN"), shipmentController.assignAgent);

module.exports = router;
