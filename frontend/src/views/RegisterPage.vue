<!-- src/views/RegisterPage.vue -->
<template>
  <div class="login-page">
    <form @submit.prevent="handleRegister">
      <h2>Đăng ký</h2>
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
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Nhập email"
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
      <div class="form-group">
        <label for="confirmPassword">Xác nhận mật khẩu</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="Xác nhận mật khẩu"
          required
        />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Đang đăng ký..." : "Đăng ký" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="switch-link">
        Đã có tài khoản?
        <router-link to="/login">Đăng nhập</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { register } = useAuth();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const error = ref("");

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "Mật khẩu và xác nhận mật khẩu không khớp.";
    return;
  }
  isLoading.value = true;
  error.value = "";
  try {
    await register(username.value, email.value, password.value);
    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    router.push({ name: "Login" }); // Chuyển hướng đến trang chủ sau khi đăng ký
  } catch (err) {
    error.value = err.message || "Đăng ký thất bại. Vui lòng thử lại.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log("RegisterPage component loaded");
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
}
form {
  opacity: 0;
  transform: translateY(40px);
  animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

@keyframes fadeInUp {
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
  font-weight: 500;
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
  background: #2ecc71; /* Màu xanh lá cho nút đăng ký */
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

button:hover {
  background: #27ae60;
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
