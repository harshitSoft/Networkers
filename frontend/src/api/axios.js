import axios from "axios";

const api = axios.create({
  baseURL: "https://networkers-rgom.onrender.com/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("networkers_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("networkers_token");
      localStorage.removeItem("networkers_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export const unwrap = (response) => response.data.data;
export default api;
