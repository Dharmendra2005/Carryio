export const API_BASE = "http://localhost:3000";

export async function apiFetch(path, options = {}) {
  const { isFormData, ...restOptions } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...restOptions,
    headers: isFormData
      ? (options.headers || {})           // no Content-Type — browser sets it
      : {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}