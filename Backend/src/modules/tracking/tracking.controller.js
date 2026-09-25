const trackingService = require("./tracking.service");
const { successResponse, errorResponse } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

const getTrackingStatus = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;
  const shipment = await trackingService.trackByNumber(trackingNumber);
  if (!shipment) {
    return errorResponse(res, 404, "Tracking number not found");
  }

  return successResponse(res, 200, "Tracking status retrieved", {
    trackingNumber: shipment.trackingNumber,
    carrier: shipment.carrier,
    status: shipment.status,
    estimatedDelivery: shipment.estimatedDelivery,
    history: shipment.statusHistory,
  });
});

module.exports = {
  getTrackingStatus,
};
