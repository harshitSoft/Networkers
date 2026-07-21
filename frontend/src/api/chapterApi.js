import api, { unwrap } from "./axios";

export const chapterApi = {
  all: () => api.get("/chapters").then(unwrap),
  one: (id) => api.get(`/chapters/${id}`).then(unwrap),
  create: (payload) => api.post("/admin/chapters", payload).then(unwrap),
  update: (id, payload) => api.put(`/admin/chapters/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/admin/chapters/${id}`).then(unwrap),
  members: (id) => api.get(`/admin/chapters/${id}/members`).then(unwrap),
  userMembers: (id) => api.get(`/user/chapters/${id}/members`).then(unwrap),
  uploadBanner: (id, file) => { const data = new FormData(); data.append("file", file); return api.post(`/admin/chapters/${id}/banner`, data).then(unwrap); }
};
