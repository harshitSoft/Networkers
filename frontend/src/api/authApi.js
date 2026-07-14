import api, { unwrap } from "./axios";
export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then(unwrap),
  login: (payload) => api.post("/auth/login", payload).then(unwrap),
  me: () => api.get("/auth/me").then(unwrap)
};
