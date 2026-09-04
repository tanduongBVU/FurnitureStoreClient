import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clientToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Xử lý khi Backend trả về lỗi — quan trọng nhất là 401 (token hết hạn/không hợp lệ).
// Tự động xoá token cũ + đá về /login, thay vì để lỗi rơi vào .catch() rời rạc ở từng
// nơi gọi API rồi hiện thông báo lỗi chung chung, gây khó hiểu cho người dùng.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("clientToken");
      localStorage.removeItem("clientUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;