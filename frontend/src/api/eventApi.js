import api, { unwrap } from "./axios";
import { cachedRequest, invalidateRequest } from "./requestCache";

export const eventApi = {
  all: () => api.get("/events").then(unwrap),
  upcoming: () => cachedRequest("events:upcoming", () => api.get("/events/upcoming").then(unwrap), 60000),
  one: (id) => api.get(`/events/${id}`).then(unwrap),
  myRsvps: () => cachedRequest("events:rsvps:mine", () => api.get("/events/rsvps/mine").then(unwrap), 30000),
  rsvp: (id, status) => api.put(`/events/${id}/rsvp`, { status }).then(unwrap).then((value) => { invalidateRequest("events:rsvps:mine"); return value; }),
  rsvpList: (id) => api.get(`/admin/events/${id}/rsvps`).then(unwrap),
  confirmAttendance: (eventId, userId, status) => api.put(`/admin/events/${eventId}/rsvps/${userId}`, { status }).then(unwrap),
  create: (payload) => api.post("/admin/events", payload).then(unwrap),
  update: (id, payload) => api.put(`/admin/events/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/admin/events/${id}`).then(unwrap),
  addImage: (id, imageUrl) => api.post(`/admin/events/${id}/images`, { imageUrl }).then(unwrap),
  uploadImage: (id, file) => { const data = new FormData(); data.append("file", file); return api.post(`/admin/events/${id}/image-upload`, data).then(unwrap); }
};
