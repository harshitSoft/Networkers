import api, { unwrap } from "./axios";
export const adminApi = {
  dashboard: () => api.get("/admin/dashboard").then(unwrap),
  users: () => api.get("/admin/users").then(unwrap),
  createUser: (payload) => api.post("/admin/users/create", payload).then(unwrap),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload).then(unwrap),
  block: (id) => api.put(`/admin/users/${id}/block`).then(unwrap),
  unblock: (id) => api.put(`/admin/users/${id}/unblock`).then(unwrap),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(unwrap),
  businesses: () => api.get("/admin/businesses").then(unwrap),
  verify: (id) => api.put(`/admin/businesses/${id}/verify`).then(unwrap),
  referrals: () => api.get("/admin/referrals").then(unwrap),
  analytics: () => api.get("/admin/analytics").then(unwrap)
};
