import api, { unwrap } from "./axios";
export const referralApi = {
  create: (payload) => api.post("/referrals", payload).then(unwrap),
  give: (payload) => api.post("/referrals/give", payload).then(unwrap),
  dashboard: () => api.get("/referrals/dashboard").then(unwrap),
  direct: (payload) => api.post("/referrals/direct", payload).then(unwrap),
  open: (payload) => api.post("/referrals/open", payload).then(unwrap),
  myOpen: () => api.get("/referrals/open/mine").then(unwrap),
  openNetwork: () => api.get("/referrals/open/network").then(unwrap),
  contactOpen: (id) => api.post(`/referrals/open/${id}/contact`).then(unwrap),
  received: () => api.get("/referrals/received").then(unwrap),
  given: () => api.get("/referrals/given").then(unwrap),
  receivedPage: (page = 0, size = 20) => api.get("/referrals/received/page", { params: { page, size } }).then(unwrap),
  givenPage: (page = 0, size = 20) => api.get("/referrals/given/page", { params: { page, size } }).then(unwrap),
  one: (id) => api.get(`/referrals/${id}`).then(unwrap),
  status: (id, status, confirmedAmount) => api.put(`/referrals/${id}/status`, { status, confirmedAmount }).then(unwrap),
  value: (id, businessValue) => api.put(`/referrals/${id}/business-value`, { businessValue }).then(unwrap)
};
