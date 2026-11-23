import api, { unwrap } from "./axios.js";
export const tipApi = {
  published: (category) => api.get("/tips", { params: category && category !== "ALL" ? { category } : {} }).then(unwrap),
  one: (id) => api.get(`/tips/${id}`).then(unwrap),
  adminAll: () => api.get("/super-admin/tips").then(unwrap),
  create: (payload) => api.post("/super-admin/tips", payload).then(unwrap),
  update: (id, payload) => api.put(`/super-admin/tips/${id}`, payload).then(unwrap),
  publish: (id) => api.patch(`/super-admin/tips/${id}/publish`).then(unwrap),
  unpublish: (id) => api.patch(`/super-admin/tips/${id}/unpublish`).then(unwrap),
  remove: (id) => api.delete(`/super-admin/tips/${id}`).then(unwrap),
};
