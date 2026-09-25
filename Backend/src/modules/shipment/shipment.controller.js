const shipmentService = require("./shipment.service");
const { successResponse, errorResponse } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

const createShipment = asyncHandler(async (req, res) => {
  const { orderId, carrier, location } = req.body;
  if (!orderId) {
    return errorResponse(res, 400, "orderId is required");
  }

  const userId = req.user?.id || req.user?._id;
  const shipment = await shipmentService.createShipment(orderId, userId, carrier, location);
  return successResponse(res, 201, "Shipment created successfully", { shipment });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, location, note } = req.body;

  if (!status) {
    return errorResponse(res, 400, "status is required");
  }

  const updatedBy = req.user ? `${req.user.role || "ADMIN"} (${req.user.firstName || req.user.email || req.user.id})` : "System";
  const userRole = req.user?.role || "ADMIN";

  const shipment = await shipmentService.updateShipmentStatus({
    shipmentId: id,
    nextStatus: status,
    location,
    note,
    updatedBy,
    userRole,
  });

  return successResponse(res, 200, `Shipment status updated to ${status}`, { shipment });
});

const assignAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;

  if (!agentId) {
    return errorResponse(res, 400, "agentId is required");
  }

  const assignedBy = req.user ? `${req.user.role} (${req.user.id})` : "Admin";
  const shipment = await shipmentService.assignDeliveryAgent(id, agentId, assignedBy);

  return successResponse(res, 200, "Delivery agent assigned successfully", { shipment });
});

const getByOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const shipment = await shipmentService.getShipmentByOrderId(orderId);
  if (!shipment) {
    return errorResponse(res, 404, "Shipment not found for this order");
  }
  return successResponse(res, 200, "Shipment retrieved successfully", { shipment });
});

const trackShipment = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  
  // Try tracking by tracking number first, then order ID
  let shipment = await shipmentService.getShipmentByTrackingNumber(identifier);
  if (!shipment) {
    shipment = await shipmentService.getShipmentByOrderId(identifier);
  }

  if (!shipment) {
    return errorResponse(res, 404, "Invalid tracking number or order ID");
  }

  return successResponse(res, 200, "Shipment tracking details retrieved", { shipment });
});

const getMyShipments = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const shipments = await shipmentService.getShipmentsForUser(userId);
  return successResponse(res, 200, "User shipments retrieved", { shipments });
});

const getAssignedShipments = asyncHandler(async (req, res) => {
  const agentId = req.user.id || req.user._id;
  const shipments = await shipmentService.getAssignedShipments(agentId);
  return successResponse(res, 200, "Assigned shipments retrieved", { shipments });
});

const getAllShipments = asyncHandler(async (req, res) => {
  const shipments = await shipmentService.getAllShipments(req.query);
  return successResponse(res, 200, "All shipments retrieved", { shipments });
});

module.exports = {
  createShipment,
  updateStatus,
  assignAgent,
  getByOrder,
  trackShipment,
  getMyShipments,
  getAssignedShipments,
  getAllShipments,
};
