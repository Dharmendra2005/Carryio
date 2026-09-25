const prisma = require("../../config/prisma");
const { validateStateTransition, SHIPMENT_STATUSES } = require("./shipment.validation");
const { getCache, setCache, clearCachePattern } = require("../../utils/redisHelper");
const metricsRegistry = require("../../utils/metrics");
const logAudit = require("../../utils/auditLogger");

class ShipmentService {
  generateTrackingNumber() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `CRY-${Date.now()}-${randomSuffix}`;
  }

  async createShipment(orderId, userId, carrier = "Carryio Express", initialLocation = "Fulfillment Hub") {
    const existing = await prisma.shipment.findUnique({
      where: { orderId },
      include: { trackingEvents: true, statusHistory: true },
    });
    if (existing) {
      return { ...existing, _id: existing.id };
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    const trackingNumber = this.generateTrackingNumber();
    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        userId,
        trackingNumber,
        carrier,
        status: SHIPMENT_STATUSES.ORDER_PLACED,
        currentLocation: initialLocation,
        estimatedDelivery,
        statusHistory: {
          create: [
            {
              status: SHIPMENT_STATUSES.ORDER_PLACED,
              updatedBy: "System",
              note: "Order placed & shipment record created",
            },
          ],
        },
        trackingEvents: {
          create: [
            {
              status: SHIPMENT_STATUSES.ORDER_PLACED,
              location: initialLocation,
              note: "Order placed & shipment record created",
              updatedBy: "System",
            },
          ],
        },
      },
      include: { trackingEvents: true, statusHistory: true },
    });

    await clearCachePattern("shipment:*");
    logAudit({ userId, action: "CREATE_SHIPMENT", resource: `Shipment:${shipment.id}`, details: { trackingNumber } });

    return { ...shipment, _id: shipment.id };
  }

  async updateShipmentStatus({ shipmentId, nextStatus, location, note = "", updatedBy = "System", userRole = "ADMIN" }) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });
    if (!shipment) {
      const err = new Error("Shipment not found");
      err.statusCode = 404;
      throw err;
    }

    const isOverride = userRole === "ADMIN";
    const validation = validateStateTransition(shipment.status, nextStatus, isOverride);
    if (!validation.valid) {
      const err = new Error(validation.message);
      err.statusCode = 400;
      throw err;
    }

    const currentLocation = location || shipment.currentLocation || "In Transit Facility";
    const noteText = note || `Status updated to ${nextStatus}`;

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: nextStatus,
        currentLocation,
        statusHistory: {
          create: {
            status: nextStatus,
            updatedBy,
            note: noteText,
          },
        },
        trackingEvents: {
          create: {
            status: nextStatus,
            location: currentLocation,
            note: noteText,
            updatedBy,
          },
        },
      },
      include: { trackingEvents: true, statusHistory: true },
    });

    // Synchronize status with Order model
    let orderStatus = "New";
    if (["PACKED", "PICKED_UP", "IN_TRANSIT", "ARRIVED_AT_HUB"].includes(nextStatus)) {
      orderStatus = "Processing";
    } else if (nextStatus === "OUT_FOR_DELIVERY") {
      orderStatus = "Shipped";
    } else if (nextStatus === "DELIVERED") {
      orderStatus = "Delivered";
    } else if (nextStatus === "CANCELLED") {
      orderStatus = "Cancelled";
    }

    await prisma.order.update({
      where: { id: shipment.orderId },
      data: { status: orderStatus },
    });

    await clearCachePattern("shipment:*");
    logAudit({ action: "UPDATE_SHIPMENT_STATUS", resource: `Shipment:${shipment.id}`, details: { nextStatus, currentLocation, updatedBy } });

    return { ...updatedShipment, _id: updatedShipment.id };
  }

  async assignDeliveryAgent(shipmentId, agentId, assignedBy = "Admin") {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });
    if (!shipment) {
      const err = new Error("Shipment not found");
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { assignedAgentId: agentId },
    });

    await clearCachePattern("shipment:*");
    logAudit({ action: "ASSIGN_DELIVERY_AGENT", resource: `Shipment:${shipmentId}`, details: { agentId, assignedBy } });

    return { ...updated, _id: updated.id };
  }

  async getShipmentByOrderId(orderId) {
    const cacheKey = `shipment:order:${orderId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      metricsRegistry.recordCacheHit();
      return cached;
    }

    metricsRegistry.recordCacheMiss();
    const shipment = await prisma.shipment.findUnique({
      where: { orderId },
      include: {
        order: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true, contact: true } },
        assignedAgent: { select: { id: true, firstName: true, lastName: true, email: true, contact: true } },
        trackingEvents: { orderBy: { createdAt: "asc" } },
        statusHistory: { orderBy: { timestamp: "asc" } },
      },
    });

    if (shipment) {
      const fullData = { ...shipment, _id: shipment.id };
      await setCache(cacheKey, fullData, 600);
      return fullData;
    }

    return null;
  }

  async getShipmentByTrackingNumber(trackingNumber) {
    const cacheKey = `shipment:tracking:${trackingNumber}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      metricsRegistry.recordCacheHit();
      return cached;
    }

    metricsRegistry.recordCacheMiss();
    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        order: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true, contact: true } },
        assignedAgent: { select: { id: true, firstName: true, lastName: true, email: true, contact: true } },
        trackingEvents: { orderBy: { createdAt: "asc" } },
        statusHistory: { orderBy: { timestamp: "asc" } },
      },
    });

    if (shipment) {
      const fullData = { ...shipment, _id: shipment.id };
      await setCache(cacheKey, fullData, 600);
      return fullData;
    }

    return null;
  }

  async getShipmentsForUser(userId) {
    const shipments = await prisma.shipment.findMany({
      where: { userId },
      include: { order: true },
      orderBy: { createdAt: "desc" },
    });
    return shipments.map((s) => ({ ...s, _id: s.id }));
  }

  async getAssignedShipments(agentId) {
    const shipments = await prisma.shipment.findMany({
      where: { assignedAgentId: agentId },
      include: {
        order: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true, contact: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return shipments.map((s) => ({ ...s, _id: s.id }));
  }

  async getAllShipments(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.carrier) where.carrier = query.carrier;

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        order: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true, contact: true } },
        assignedAgent: { select: { id: true, firstName: true, lastName: true, email: true, contact: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return shipments.map((s) => ({ ...s, _id: s.id }));
  }
}

module.exports = new ShipmentService();
