import api, { unwrap } from "./axios";
export const tyfcbApi = {
  dashboard: () => api.get("/tyfcb/dashboard").then(unwrap),
  given: () => api.get("/tyfcb/given").then(unwrap),
  received: () => api.get("/tyfcb/received").then(unwrap),
  members: (name) => api.get("/tyfcb/members", { params: { name } }).then(unwrap),
  create: (payload) => api.post("/tyfcb", payload).then(unwrap),
  slip: (id) => api.get(`/tyfcb/${id}/slip`).then(unwrap),
};
