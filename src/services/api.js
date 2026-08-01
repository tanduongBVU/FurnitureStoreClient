import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:7025/api", // Đổi thành URL API của bạn
});

export default api;