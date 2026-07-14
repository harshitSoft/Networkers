import api, { unwrap } from "./axios";
export const connectionApi = {
  send: (id) => api.post(`/connections/send/${id}`).then(unwrap),
  accept: (id) => api.put(`/connections/accept/${id}`).then(unwrap),
  reject: (id) => api.put(`/connections/reject/${id}`).then(unwrap),
  received: () => api.get("/connections/received").then(unwrap),
  sent: () => api.get("/connections/sent").then(unwrap),
  network: () => api.get("/connections/my-network").then(unwrap),
  remove: (id) => api.delete(`/connections/${id}`).then(unwrap),
  cancel: (id) => api.delete(`/connections/cancel/${id}`).then(unwrap)
};
