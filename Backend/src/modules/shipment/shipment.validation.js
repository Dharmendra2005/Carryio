const SHIPMENT_STATUSES = {
  ORDER_PLACED: "ORDER_PLACED",
  PACKED: "PACKED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  ARRIVED_AT_HUB: "ARRIVED_AT_HUB",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const ALLOWED_TRANSITIONS = {
  [SHIPMENT_STATUSES.ORDER_PLACED]: [SHIPMENT_STATUSES.PACKED, SHIPMENT_STATUSES.CANCELLED],
  [SHIPMENT_STATUSES.PACKED]: [SHIPMENT_STATUSES.PICKED_UP, SHIPMENT_STATUSES.CANCELLED],
  [SHIPMENT_STATUSES.PICKED_UP]: [SHIPMENT_STATUSES.IN_TRANSIT, SHIPMENT_STATUSES.CANCELLED],
  [SHIPMENT_STATUSES.IN_TRANSIT]: [SHIPMENT_STATUSES.ARRIVED_AT_HUB, SHIPMENT_STATUSES.CANCELLED],
  [SHIPMENT_STATUSES.ARRIVED_AT_HUB]: [SHIPMENT_STATUSES.OUT_FOR_DELIVERY, SHIPMENT_STATUSES.CANCELLED],
  [SHIPMENT_STATUSES.OUT_FOR_DELIVERY]: [SHIPMENT_STATUSES.DELIVERED, SHIPMENT_STATUSES.CANCELLED],
  [SHIPMENT_STATUSES.DELIVERED]: [],
  [SHIPMENT_STATUSES.CANCELLED]: [],
};

const ORDERED_STEPS = [
  SHIPMENT_STATUSES.ORDER_PLACED,
  SHIPMENT_STATUSES.PACKED,
  SHIPMENT_STATUSES.PICKED_UP,
  SHIPMENT_STATUSES.IN_TRANSIT,
  SHIPMENT_STATUSES.ARRIVED_AT_HUB,
  SHIPMENT_STATUSES.OUT_FOR_DELIVERY,
  SHIPMENT_STATUSES.DELIVERED,
];

function validateStateTransition(currentStatus, nextStatus, isOverride = false) {
  if (!Object.values(SHIPMENT_STATUSES).includes(nextStatus)) {
    return {
      valid: false,
      message: `Invalid target status '${nextStatus}'. Must be one of: ${Object.values(SHIPMENT_STATUSES).join(", ")}`,
    };
  }

  if (currentStatus === nextStatus) {
    return {
      valid: false,
      message: `Shipment is already in status '${currentStatus}'`,
    };
  }

  if (isOverride) {
    return { valid: true };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      valid: false,
      message: `Invalid state transition from '${currentStatus}' to '${nextStatus}'. Allowed next states: [${allowed.join(", ")}]`,
    };
  }

  return { valid: true };
}

module.exports = {
  SHIPMENT_STATUSES,
  ALLOWED_TRANSITIONS,
  ORDERED_STEPS,
  validateStateTransition,
};

