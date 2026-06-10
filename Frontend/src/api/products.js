import { apiFetch } from "./config";
import { mapProductForManager, mapProductForStore } from "../utils/productMappers";

export async function fetchStoreProducts() {
  const data = await apiFetch("/products");
  return (data.products || []).map(mapProductForStore);
}

export async function fetchManagerProducts() {
  const data = await apiFetch("/products/manager/all");
  return (data.products || []).map(mapProductForManager);
}

export async function createProduct(payload) {
  const data = await apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapProductForManager(data.product);
}

export async function updateProduct(id, payload) {
  const data = await apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapProductForManager(data.product);
}

export async function deleteProduct(id) {
  await apiFetch(`/products/${id}`, { method: "DELETE" });
}
