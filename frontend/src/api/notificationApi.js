import api, { unwrap } from "./axios";
import { cachedRequest, invalidateRequest } from "./requestCache";
export const notificationApi = {
  all: () => cachedRequest("notifications:unread", () => api.get("/notifications/unread-summary").then(unwrap), 15000),
  page: (page = 0, size = 20) => api.get("/notifications", { params: { page, size } }).then(unwrap),
  unreadSummary: () => cachedRequest("notifications:unread", () => api.get("/notifications/unread-summary").then(unwrap), 15000),
  read: (id) => api.put(`/notifications/${id}/read`).then(unwrap).then((value) => { invalidateRequest("notifications:unread"); return value; }),
  readAll: () => api.put("/notifications/read-all").then(unwrap).then((value) => { invalidateRequest("notifications:unread"); return value; })
};
