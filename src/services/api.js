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

// Các API "xác thực" — 401 ở đây nghĩa là NHẬP SAI (email/mật khẩu, token Google, link đặt lại
// mật khẩu...) chứ KHÔNG phải phiên đăng nhập hết hạn. Phải để lỗi rơi về .catch() của form
// để hiện chữ đỏ cho khách sửa lại, TUYỆT ĐỐI không được tải lại trang (sẽ làm mất thông báo lỗi).
const AUTH_ENDPOINTS = /\/Auth\/(login|register|google|forgot-password|reset-password)\b/i;

// Xử lý khi Backend trả về lỗi — quan trọng nhất là 401 (token hết hạn/không hợp lệ).
// Với request thông thường: xoá token cũ + đưa về /login. Với các API xác thực ở trên: bỏ qua,
// để nơi gọi tự hiện lỗi. Không chuyển hướng nếu đang ở sẵn trang /login để tránh nạp lại vô ích.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = AUTH_ENDPOINTS.test(error.config?.url || "");

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("clientToken");
      localStorage.removeItem("clientUser");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;