import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7025/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clientToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;