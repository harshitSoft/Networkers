import api, { unwrap } from "./axios";
export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then(unwrap),
  login: (payload) => api.post("/auth/login", payload).then(unwrap),
  me: () => api.get("/auth/me").then(unwrap),
  todaysBirthdays: () => api.get("/auth/birthdays/today").then(unwrap),
  updateProfile: (payload) => api.put("/auth/profile", payload).then(unwrap),
  uploadProfileImage: (file) => {
    const data = new FormData();
    data.append("file", file);
    return api.post("/auth/profile/image", data).then(unwrap);
  },
  changePassword: (payload) =>
    api.put("/auth/change-password", payload).then(unwrap),
  requestPasswordChangeOtp: () =>
    api.post("/auth/password/change/request").then(unwrap),
  confirmPasswordChange: (payload) =>
    api.put("/auth/password/change/confirm", payload).then(unwrap),
  requestForgotPasswordOtp: (email) =>
    api.post("/auth/password/forgot/request", { email }).then(unwrap),
  resetForgottenPassword: (payload) =>
    api.post("/auth/password/forgot/reset", payload).then(unwrap),
};
