import api, { unwrap } from "./axios";
export const communityApi = {
  create: (payload) => api.post("/community/posts", payload, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap),
  all: () => api.get("/community/posts").then(unwrap),
  one: (id) => api.get(`/community/posts/${id}`).then(unwrap),
  update: (id, caption) => api.put(`/community/posts/${id}`, { caption }).then(unwrap),
  remove: (id) => api.delete(`/community/posts/${id}`).then(unwrap),
  kudos: (id) => api.post(`/community/posts/${id}/kudos`).then(unwrap),
  comment: (id, content) => api.post(`/community/posts/${id}/comments`, { content }).then(unwrap),
};
