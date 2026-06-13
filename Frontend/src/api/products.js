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

export async function createProduct(formData) {
  const data = await apiFetch("/products", {
    method: "POST",
    body: formData,          // ← FormData directly, no JSON.stringify
    isFormData: true,        // ← signal to apiFetch to skip Content-Type header
  });
  return mapProductForManager(data.product);
}

export async function updateProduct(id, formData) {
  const data = await apiFetch(`/products/${id}`, {
    method: "PUT",
    body: formData,          // ← FormData directly
    isFormData: true,
  });
  return mapProductForManager(data.product);
}

export async function deleteProduct(id) {
  await apiFetch(`/products/${id}`, { method: "DELETE" });
}