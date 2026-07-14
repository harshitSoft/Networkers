import api, { unwrap } from "./axios";
export const businessApi = {
  create: (payload) => api.post("/business/profile", payload).then(unwrap),
  update: (payload) => api.put("/business/profile", payload).then(unwrap),
  my: () => api.get("/business/my-profile").then(unwrap),
  all: () => api.get("/business/all").then(unwrap),
  one: (id) => api.get(`/business/${id}`).then(unwrap),
  search: (params) => api.get("/business/search", { params }).then(unwrap)
};
