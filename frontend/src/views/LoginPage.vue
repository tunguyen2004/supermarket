```vue
<!-- src/views/LoginPage.vue -->
<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin">
      <h2>Đăng nhập</h2>
      <div class="form-group">
        <label for="username">Tên đăng nhập</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Nhập tên đăng nhập"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Mật khẩu</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Nhập mật khẩu"
          required
        />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Đang đăng nhập..." : "Đăng nhập" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="switch-link">
        Chưa có tài khoản?
        <router-link to="/register">Đăng ký</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import Swal from "sweetalert2"; // ✅ import SweetAlert2

const router = useRouter();
const { login } = useAuth();

const username = ref("");
const password = ref("");
const isLoading = ref(false);
const error = ref("");

const handleLogin = async () => {
  isLoading.value = true;
  error.value = "";
  try {
    await login(username.value, password.value);

    // ✅ Hiển thị alert đẹp
    await Swal.fire({
      icon: "success",
      title: "Đăng nhập thành công!",
      text: `Chào mừng ${username.value}!`,
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });

    router.push({ name: "DashboardOverview" });
  } catch (err) {
    // ❌ Alert lỗi
    await Swal.fire({
      icon: "error",
      title: "Lỗi đăng nhập",
      text: err.message || "Vui lòng thử lại.",
      confirmButtonText: "Thử lại",
    });

    error.value = err.message || "Đăng nhập thất bại. Vui lòng thử lại.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log("LoginPage component loaded");
});
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
}

form {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  position: relative;
  animation: fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h2 {
  text-align: center;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0 0 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 3px solid #3498db;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

label {
  font-weight: 600;
  color: #34495e;
  font-size: 1.1rem;
}

input {
  padding: 0.9rem 1.2rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.4);
}

button {
  padding: 0.9rem;
  background: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

button:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.error {
  color: #e74c3c;
  text-align: center;
  font-size: 1rem;
  margin-top: 1.2rem;
  padding: 0.5rem;
  background: #ffebee;
  border-radius: 4px;
}

.switch-link {
  text-align: center;
  font-size: 0.9rem;
  color: #34495e;
}

.switch-link a {
  color: #3498db;
  text-decoration: none;
  margin-left: 0.5rem;
}

.switch-link a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  form {
    padding: 1.5rem;
    max-width: 90%;
  }

  h2 {
    font-size: 1.6rem;
  }

  input {
    padding: 0.7rem 1rem;
  }

  button {
    font-size: 1.1rem;
    padding: 0.7rem;
  }
}
</style>
