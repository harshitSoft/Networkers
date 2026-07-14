import api, { unwrap } from "./axios";
export const communityApi = {
  create: (payload) => api.post("/community/posts", payload).then(unwrap),
  all: () => api.get("/community/posts").then(unwrap),
  one: (id) => api.get(`/community/posts/${id}`).then(unwrap),
  update: (id, payload) => api.put(`/community/posts/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/community/posts/${id}`).then(unwrap),
  comment: (id, content) => api.post(`/community/posts/${id}/comments`, { content }).then(unwrap),
  comments: (id) => api.get(`/community/posts/${id}/comments`).then(unwrap)
};
