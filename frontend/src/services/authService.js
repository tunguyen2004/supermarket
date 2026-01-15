// src/services/authService.js
import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL || "http://localhost:3000";

export default {
  login(credentials) {
    // Giả lập API để test
    return Promise.resolve({
      data: { token: "fake-token", user: { name: credentials.username } },
    });
    // return axios.post(`${API_URL}/login`, credentials);
  },
  register(credentials) {
    // Giả lập API để test
    if (credentials.username === "admin" && credentials.password === "admin") {
      return Promise.reject(new Error("Tên đăng nhập đã tồn tại"));
    }
    return Promise.resolve({
      data: {
        token: "fake-token",
        user: { name: credentials.username, email: credentials.email },
      },
    });
    // return axios.post(`${API_URL}/register`, credentials);
  },
  logout() {
    return Promise.resolve();
    // return axios.post(`${API_URL}/logout`);
  },
};
