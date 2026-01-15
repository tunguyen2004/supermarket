import { ref } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/authService";

export function useAuth() {
  const router = useRouter();
  const user = ref(JSON.parse(localStorage.getItem("user") || "{}"));
  const isAuthenticated = ref(!!localStorage.getItem("token"));

  const login = async (username, password) => {
    try {
      const response = await authService.login({ username, password });
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      user.value = userData;
      isAuthenticated.value = true;
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authService.register({
        username,
        email,
        password,
      });
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      user.value = userData;
      isAuthenticated.value = true;
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      user.value = {};
      isAuthenticated.value = false;
      router.push({ name: "LoginPage" });
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
