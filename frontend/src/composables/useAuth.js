import { ref } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/authService";

const normalizeRole = (role_id, role_name) => {
  const name = (role_name || "").toLowerCase();
  if (role_id === 1 || name.includes("admin")) return "admin";
  if (role_id === 2 || name.includes("staff")) return "staff";
  return undefined;
};

export function useAuth() {
  const router = useRouter();
  const user = ref(JSON.parse(localStorage.getItem("user") || "{}"));
  const isAuthenticated = ref(!!localStorage.getItem("token"));

  const login = async (username, password) => {
    try {
      const response = await authService.login({ username, password });
      const payload = response?.data?.data ?? response?.data ?? {};
      const token = payload.token;
      const role = normalizeRole(payload.role_id, payload.role_name);
      if (!token) throw new Error("Thiếu token từ server");

      const normalizedUser = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        full_name: payload.full_name,
        role_id: payload.role_id,
        role_name: payload.role_name,
        role,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      user.value = normalizedUser;
      isAuthenticated.value = true;
      return normalizedUser;
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
      const payload = response?.data?.data ?? response?.data ?? {};
      const role = normalizeRole(payload.role_id, payload.role_name);
      const token = payload.token;
      if (!token) throw new Error("Thiếu token từ server");

      const normalizedUser = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        full_name: payload.full_name,
        role_id: payload.role_id,
        role_name: payload.role_name,
        role,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      user.value = normalizedUser;
      isAuthenticated.value = true;
      return normalizedUser;
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
      router.push({ name: "Login" });
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
