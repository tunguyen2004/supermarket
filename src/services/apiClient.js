// src/services/apiClient.js
import axios from "axios";

// Tạo instance axios
const apiClient = axios.create({
  baseURL: "https://api.example.com", // Đổi sang API backend thật của bạn
  timeout: 10000, // 10 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptors để tự động gắn token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accestoken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ!");
      // Có thể redirect về trang login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
