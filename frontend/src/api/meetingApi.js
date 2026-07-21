import api, { unwrap } from "./axios";
export const meetingApi = {
  request: (payload) => api.post("/meetings/request", payload).then(unwrap),
  accept: (id) => api.put(`/meetings/${id}/accept`).then(unwrap),
  reject: (id) => api.put(`/meetings/${id}/reject`).then(unwrap),
  cancel: (id) => api.put(`/meetings/${id}/cancel`).then(unwrap),
  received: () => api.get("/meetings/received").then(unwrap),
  sent: () => api.get("/meetings/sent").then(unwrap)
};
export const monthlyMeetingApi = {
  mine: (month) => api.get("/monthly-meetings/mine", { params: month ? { month } : {} }).then(unwrap),
  edit: (id, payload) => api.put(`/monthly-meetings/${id}`, payload).then(unwrap),
  comment: (id, text) => api.post(`/monthly-meetings/${id}/comments`, { text }).then(unwrap),
  adminOverview: (chapterId, month) => api.get(`/monthly-meetings/admin/chapters/${chapterId}`, { params: month ? { month } : {} }).then(unwrap),
  regenerate: (chapterId, month) => api.post(`/monthly-meetings/admin/chapters/${chapterId}/regenerate`, null, { params: month ? { month } : {} }).then(unwrap)
};
