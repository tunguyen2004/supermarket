/**
 * Auth Store - Quản lý authentication state
 * Sử dụng Pinia
 */
import { defineStore } from "pinia";
import authService from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    isAuthenticated: !!localStorage.getItem("token"),
    loading: false,
    error: null,
  }),

  getters: {
    // Kiểm tra user có quyền admin không
    isAdmin: (state) => state.user?.role_id === 1,

    // Kiểm tra user có quyền manager không
    isManager: (state) => state.user?.role_id === 2,

    // Kiểm tra user có quyền staff không
    isStaff: (state) => state.user?.role_id === 3,

    // Lấy full name của user
    userName: (state) => state.user?.full_name || "Guest",

    // Lấy avatar URL
    userAvatar: (state) => state.user?.avatar_url || "",

    // Kiểm tra có đang loading không
    isLoading: (state) => state.loading,

    // Lấy error message
    errorMessage: (state) => state.error,
  },

  actions: {
    /**
     * Đăng nhập
     * @param {Object} credentials - { username, password }
     */
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.login(credentials);

        // Backend trả về { status: 'OK', message, data }
        if (response.data.status === "OK" || response.data.success) {
          const { token, refreshToken, ...userData } = response.data.data;

          // Lưu vào state
          this.token = token;
          this.refreshToken = refreshToken;
          this.user = userData;
          this.isAuthenticated = true;

          // Lưu vào localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", JSON.stringify(userData));

          // Clear error sau khi login thành công
          this.error = null;

          return { success: true };
        } else {
          throw new Error(response.data.message || "Login failed");
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          "Đăng nhập thất bại";
        this.isAuthenticated = false;
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Đăng xuất
     */
    async logout() {
      this.loading = true;

      try {
        await authService.logout();
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // Clear state
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        this.isAuthenticated = false;

        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        this.loading = false;
      }
    },

    /**
     * Refresh token
     */
    async refreshAccessToken() {
      try {
        const response = await authService.refreshToken({
          token: this.refreshToken,
        });

        if (response.data.success) {
          const { token } = response.data.data;
          this.token = token;
          localStorage.setItem("token", token);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Refresh token error:", error);
        await this.logout();
        return false;
      }
    },

    /**
     * Load user từ localStorage (khi refresh page)
     */
    loadUserFromStorage() {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          this.token = token;
          this.user = JSON.parse(userStr);
          this.isAuthenticated = true;
        } catch (error) {
          console.error("Load user from storage error:", error);
          this.logout();
        }
      }
    },

    /**
     * Cập nhật thông tin user
     */
    updateUser(userData) {
      this.user = { ...this.user, ...userData };
      localStorage.setItem("user", JSON.stringify(this.user));
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },
  },
});
