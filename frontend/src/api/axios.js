import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api"
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

export const unwrap = (response) => {
  const contentType = response.headers?.["content-type"] || "";
  if (contentType.includes("text/html")) {
    throw new Error("The API returned the frontend page instead of JSON. Check the backend API URL.");
  }
  if (!response.data || !Object.prototype.hasOwnProperty.call(response.data, "data")) {
    throw new Error("The API returned an invalid response.");
  }
  return response.data.data;
};
export default api;
