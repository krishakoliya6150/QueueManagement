import axios from "axios";

export const TOKEN_KEY = "queuesense_token";
export const USER_KEY = "queuesense_user";

const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export const http = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event("queuesense:auth-expired"));
    }
    return Promise.reject(err);
  }
);
