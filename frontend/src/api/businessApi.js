import api, { unwrap } from "./axios";
export const businessApi = {
  create: (payload) => api.post("/business/profile", payload).then(unwrap),
  update: (payload) => api.put("/business/profile", payload).then(unwrap),
  my: () => api.get("/business/my-profile").then(unwrap),
  all: () => api.get("/business/all").then(unwrap),
  one: (id) => api.get(`/business/${id}`).then(unwrap),
  search: (params) => api.get("/business/search", { params }).then(unwrap),
  uploadLogo: (file) => { const body = new FormData(); body.append("file", file); return api.put("/business/profile/logo", body, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap); }
};
