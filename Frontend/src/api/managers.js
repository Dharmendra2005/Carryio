import { apiFetch } from "./config";

export async function fetchManagerProfile() {
  const data = await apiFetch("/manager/get-me");
  return data.manager;
}

export async function fetchAllManagers() {
  const data = await apiFetch("/manager/all");
  return data.managers || [];
}

export async function fetchDashboardStats() {
  return apiFetch("/manager/dashboard");
}

export async function inviteManager({ name, email, password }) {
  return apiFetch("/manager/register", {
    method: "POST",
    body: JSON.stringify({
      Username: name,
      email,
      password: password || `Carryio@${Date.now().toString().slice(-6)}`,
    }),
  });
}
