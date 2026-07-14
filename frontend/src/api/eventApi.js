import api, { unwrap } from "./axios";

export const eventApi = {
  all: () => api.get("/events").then(unwrap),
  upcoming: () => api.get("/events/upcoming").then(unwrap),
  one: (id) => api.get(`/events/${id}`).then(unwrap),
  create: (payload) => api.post("/admin/events", payload).then(unwrap),
  update: (id, payload) => api.put(`/admin/events/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/admin/events/${id}`).then(unwrap),
  addImage: (id, imageUrl) => api.post(`/admin/events/${id}/images`, { imageUrl }).then(unwrap)
};
