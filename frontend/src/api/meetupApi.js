import api, { unwrap } from "./axios";
export const meetupApi = {
  all: () => api.get("/meetups").then(unwrap),
  one: (id) => api.get(`/meetups/${id}`).then(unwrap),
  join: (id) => api.post(`/meetups/${id}/join`).then(unwrap),
  cancel: (id) => api.put(`/meetups/${id}/cancel-join`).then(unwrap),
  attendees: (id) => api.get(`/meetups/${id}/attendees`).then(unwrap),
  my: () => api.get("/meetups/my").then(unwrap),
  create: (payload) => api.post("/meetups/admin", payload).then(unwrap),
  update: (id, payload) => api.put(`/meetups/admin/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/meetups/admin/${id}`).then(unwrap)
};
