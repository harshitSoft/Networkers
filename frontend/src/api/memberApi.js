import api, { unwrap } from "./axios";

export const memberApi = {
  search: (params = {}) => api.get("/members", { params }).then(unwrap)
};
