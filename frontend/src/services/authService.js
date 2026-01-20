// src/services/authService.js
import apiClient from "./apiClient";

export default {
  login(credentials) {
    return apiClient.post("/api/auth/login", credentials);
  },

  // register(credentials) {
  //   // Giả lập API để test
  //   if (credentials.username === "admin" && credentials.password === "admin") {
  //     return Promise.reject(new Error("Tên đăng nhập đã tồn tại"));
  //   }
  //   return Promise.resolve({
  //     data: {
  //       status: "OK",
  //       message: "Register successful",
  //       data: {
  //         token: "fake-token",
  //         id: Date.now(),
  //         username: credentials.username,
  //         email: credentials.email,
  //         full_name: credentials.username,
  //         role_id: 2,
  //         role_name: "Staff",
  //       },
  //     },
  //   });
  //   // return apiClient.post("/register", credentials);
  // },
  logout() {
    return apiClient.post("/api/auth/logout").finally(() => {
      localStorage.clear();
    });
  },
};
