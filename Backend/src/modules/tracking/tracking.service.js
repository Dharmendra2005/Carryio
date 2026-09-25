const shipmentService = require("../shipment/shipment.service");

class TrackingService {
  async trackByNumber(trackingNumber) {
    return await shipmentService.getShipmentByTrackingNumber(trackingNumber);
  }

  async trackByOrderId(orderId) {
    return await shipmentService.getShipmentByOrderId(orderId);
  }
}

module.exports = new TrackingService();
