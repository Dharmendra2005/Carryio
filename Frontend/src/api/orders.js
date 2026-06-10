import { apiFetch } from "./config";

export async function fetchManagerOrders() {
  const data = await apiFetch("/orders/manager/all");
  return data.orders || [];
}

export async function updateOrderStatus(orderId, status) {
  const data = await apiFetch(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data.order;
}
