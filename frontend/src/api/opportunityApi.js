import api, { unwrap } from "./axios";
export const opportunityApi = {
  create: (payload) => api.post("/opportunities", payload).then(unwrap),
  all: () => api.get("/opportunities").then(unwrap),
  my: () => api.get("/opportunities/my").then(unwrap),
  one: (id) => api.get(`/opportunities/${id}`).then(unwrap),
  update: (id, payload) => api.put(`/opportunities/${id}`, payload).then(unwrap),
  close: (id) => api.put(`/opportunities/${id}/close`).then(unwrap),
  remove: (id) => api.delete(`/opportunities/${id}`).then(unwrap)
};
