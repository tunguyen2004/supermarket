<template>
  <div class="login-page">
    <div class="background-decoration" aria-hidden="true">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
      <div class="grid-overlay"></div>
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <form @submit.prevent="handleLogin" class="login-form">
      <div class="card-glow"></div>
      <div class="card-outline"></div>

      <div class="form-header">
        <div class="top-badge">Hệ thống quản lý</div>

        <div class="logo-container">
          <div class="logo-ring">
            <svg
              class="logo-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2>Đăng nhập</h2>
        <p class="subtitle">
          Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.
        </p>
      </div>

      <div class="form-body">
        <div class="form-group">
          <label for="username">
            <svg
              class="input-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                cx="12"
                cy="7"
                r="4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Tên đăng nhập
          </label>
          <div class="input-wrapper">
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              required
              autocomplete="username"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">
            <svg
              class="input-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Mật khẩu
          </label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Nhập mật khẩu"
              required
              autocomplete="current-password"
            />
          </div>
        </div>

        <button type="submit" :disabled="isLoading" class="submit-button">
          <span v-if="!isLoading">Đăng nhập</span>
          <span v-else class="loading-content">
            <svg
              class="spinner"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                stroke-opacity="0.25"
              />
              <path
                d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
              />
            </svg>
            Đang đăng nhập...
          </span>
        </button>

        <div v-if="error" class="error-message">
          <svg
            class="error-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M12 8V12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M12 16H12.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ error }}</span>
        </div>

        <div class="form-footer">
          <span>© 2026 • Secure Login</span>
        </div>
      </div>
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
    const loggedInUser = await login(username.value, password.value);

    // ✅ Hiển thị alert đẹp
    await Swal.fire({
      icon: "success",
      title: "Đăng nhập thành công!",
      text: `Chào mừng ${username.value}!`,
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });

    const targetRoute =
      loggedInUser?.role === "staff"
        ? { name: "StaffPOS" }
        : { name: "DashboardOverview" };
    router.push(targetRoute);
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
:global(*) {
  box-sizing: border-box;
}

.login-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  overflow: hidden;
  background: radial-gradient(
      circle at 15% 20%,
      rgba(255, 255, 255, 0.12),
      transparent 35%
    ),
    radial-gradient(
      circle at 85% 15%,
      rgba(255, 255, 255, 0.08),
      transparent 30%
    ),
    linear-gradient(135deg, #0f172a 0%, #1d4ed8 28%, #7c3aed 58%, #0ea5e9 100%);
  background-size: 100% 100%;
}

.background-decoration {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.06) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(
    circle at center,
    rgba(0, 0, 0, 1),
    transparent 90%
  );
  opacity: 0.4;
}

.aurora {
  position: absolute;
  border-radius: 999px;
  filter: blur(40px);
  opacity: 0.35;
  animation: float 18s ease-in-out infinite;
}

.aurora-1 {
  width: 340px;
  height: 340px;
  top: -80px;
  left: -70px;
  background: #38bdf8;
}

.aurora-2 {
  width: 300px;
  height: 300px;
  right: -60px;
  bottom: -50px;
  background: #a855f7;
  animation-delay: 4s;
}

.aurora-3 {
  width: 240px;
  height: 240px;
  top: 40%;
  left: 58%;
  background: #22d3ee;
  animation-delay: 8s;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(12px);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 280px;
  height: 280px;
  top: -90px;
  left: -90px;
}

.circle-2 {
  width: 190px;
  height: 190px;
  bottom: 8%;
  right: 4%;
  animation-delay: 5s;
}

.circle-3 {
  width: 130px;
  height: 130px;
  top: 18%;
  right: 16%;
  animation-delay: 9s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(22px, -20px) scale(1.05);
  }
  66% {
    transform: translate(-16px, 16px) scale(0.96);
  }
}

.login-form {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  padding: 2.75rem 2.25rem 2rem;
  border-radius: 24px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(255, 255, 255, 0.87) 100%
  );
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.38),
    0 8px 24px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  overflow: hidden;
  animation: slideUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}

.card-glow {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 160px;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.18),
    transparent 70%
  );
  filter: blur(6px);
  pointer-events: none;
}

.card-outline {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), transparent 35%),
    linear-gradient(90deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08));
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  padding: 1px;
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.form-header {
  text-align: center;
  position: relative;
}

.top-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.9rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #4338ca;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.18);
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.85rem;
}

.logo-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.95),
      rgba(255, 255, 255, 0.78)
    ),
    linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(168, 85, 247, 0.16));
  border: 1px solid rgba(99, 102, 241, 0.15);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: #4f46e5;
  animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.9;
  }
}

h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #0f172a;
  background: linear-gradient(135deg, #312e81 0%, #4338ca 45%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0.55rem 0 0;
  color: #64748b;
  font-size: 0.93rem;
  line-height: 1.45;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #334155;
  font-size: 0.92rem;
  font-weight: 700;
}

.input-icon {
  width: 17px;
  height: 17px;
  color: #6366f1;
  flex-shrink: 0;
}

.input-wrapper {
  position: relative;
  border-radius: 14px;
  transition: transform 0.2s ease;
}

.input-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    rgba(168, 85, 247, 0.06)
  );
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.input-wrapper:focus-within::before {
  opacity: 1;
}

input {
  width: 100%;
  padding: 0.95rem 1rem;
  border: 1.5px solid #dbe3f0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-size: 0.98rem;
  outline: none;
  transition: all 0.25s ease;
}

input::placeholder {
  color: #94a3b8;
}

input:hover {
  border-color: #c7d2fe;
  box-shadow: 0 6px 14px rgba(99, 102, 241, 0.08);
}

input:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12),
    0 8px 18px rgba(99, 102, 241, 0.12);
  transform: translateY(-1px);
}

.submit-button {
  position: relative;
  margin-top: 0.35rem;
  border: none;
  border-radius: 14px;
  padding: 0.95rem 1.25rem;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #06b6d4 100%);
  box-shadow: 0 10px 22px rgba(79, 70, 229, 0.28),
    0 6px 14px rgba(6, 182, 212, 0.15);
  transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.25s ease;
}

.submit-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 15%,
    rgba(255, 255, 255, 0.22) 35%,
    transparent 55%
  );
  transform: translateX(-140%);
  transition: transform 0.55s ease;
}

.submit-button:hover::before {
  transform: translateX(140%);
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(79, 70, 229, 0.34),
    0 8px 16px rgba(6, 182, 212, 0.18);
  filter: saturate(1.05);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button:disabled {
  cursor: not-allowed;
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  box-shadow: none;
  filter: none;
}

.submit-button:disabled::before {
  display: none;
}

.loading-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.85rem 0.95rem;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.22);
  background: linear-gradient(
    135deg,
    rgba(254, 242, 242, 0.9),
    rgba(255, 255, 255, 0.95)
  );
  color: #b91c1c;
  font-size: 0.9rem;
  line-height: 1.35;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  animation: shake 0.35s ease-in-out;
}

.error-icon {
  width: 18px;
  height: 18px;
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 1px;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.form-footer {
  margin-top: 0.15rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.78rem;
  user-select: none;
}

/* Responsive */
@media (max-width: 640px) {
  .login-page {
    padding: 1rem;
  }

  .login-form {
    max-width: 100%;
    padding: 2rem 1.15rem 1.35rem;
    border-radius: 20px;
    gap: 1.2rem;
  }

  .logo-ring {
    width: 64px;
    height: 64px;
  }

  .logo-icon {
    width: 34px;
    height: 34px;
  }

  h2 {
    font-size: 1.7rem;
  }

  .subtitle {
    font-size: 0.88rem;
  }

  input {
    font-size: 0.95rem;
    padding: 0.9rem 0.9rem;
  }

  .submit-button {
    font-size: 0.96rem;
    padding: 0.9rem 1rem;
  }

  .circle-1,
  .circle-2,
  .circle-3,
  .grid-overlay {
    display: none;
  }
}

@media (max-width: 420px) {
  .top-badge {
    font-size: 0.72rem;
    padding: 0.32rem 0.7rem;
  }

  h2 {
    font-size: 1.45rem;
  }

  .subtitle {
    margin-top: 0.45rem;
    font-size: 0.84rem;
  }

  .form-body {
    gap: 1rem;
  }

  label {
    font-size: 0.88rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .aurora,
  .circle,
  .logo-icon,
  .spinner,
  .login-form {
    animation: none !important;
  }

  .submit-button,
  input {
    transition: none !important;
  }
}
</style>
