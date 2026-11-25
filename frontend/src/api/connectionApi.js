import api, { unwrap } from "./axios";
export const connectionApi = {
  send: (id, message) => api.post(`/connections/send/${id}`, { message }).then(unwrap),
  accept: (id) => api.put(`/connections/accept/${id}`).then(unwrap),
  reject: (id) => api.put(`/connections/reject/${id}`).then(unwrap),
  received: () => api.get("/connections/received").then(unwrap),
  sent: () => api.get("/connections/sent").then(unwrap),
  network: () => api.get("/connections/my-network").then(unwrap),
  networkPage: (params) => api.get("/connections/my-network/page", { params }).then(unwrap),
  remove: (id) => api.delete(`/connections/${id}`).then(unwrap),
  cancel: (id) => api.delete(`/connections/cancel/${id}`).then(unwrap),
  discover: (params) => api.get("/connections/discover", { params }).then(unwrap),
  suggestions: (limit = 10) => api.get("/connections/suggestions", { params: { limit } }).then(unwrap),
  dashboard: () => api.get("/connections/dashboard").then(unwrap),
  member: (id) => api.get(`/connections/members/${id}`).then(unwrap),
  adminOverview: () => api.get("/connections/admin/overview").then(unwrap)
};
