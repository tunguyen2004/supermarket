// src/services/apiClient.js
import httpClient from "@/config/httpClient";

// Tạo instance axios
export default httpClient;
/*
  timeout: 20000, // 20 giây

// Thêm interceptors để tự động gắn token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
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
  },
);

*/
