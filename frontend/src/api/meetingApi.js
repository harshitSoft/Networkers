import api, { unwrap } from "./axios";
export const meetingApi = {
  request: (payload) => api.post("/meetings/request", payload).then(unwrap),
  accept: (id) => api.put(`/meetings/${id}/accept`).then(unwrap),
  reject: (id) => api.put(`/meetings/${id}/reject`).then(unwrap),
  cancel: (id) => api.put(`/meetings/${id}/cancel`).then(unwrap),
  received: () => api.get("/meetings/received").then(unwrap),
  sent: () => api.get("/meetings/sent").then(unwrap)
};
