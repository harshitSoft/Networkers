import api, { unwrap } from "./axios";
export const notificationApi = {
  all: () => api.get("/notifications").then(unwrap),
  read: (id) => api.put(`/notifications/${id}/read`).then(unwrap),
  readAll: () => api.put("/notifications/read-all").then(unwrap)
};
