<template>
  <header class="staff-header">
    <div class="brand">
      <div class="logo-dot"></div>
      <div class="brand-text">
        <div class="brand-title">MINI MART POS</div>
        <div class="brand-sub">Bán hàng nhanh · Quét mã · In hóa đơn</div>
      </div>
    </div>

    <div class="center">
      <div class="pill">
        <span class="pill-dot"></span>
        <span class="pill-text">Online</span>
      </div>

      <div class="pill soft">
        <span class="pill-text">Ca: {{ shiftName }}</span>
      </div>

      <div class="clock">
        {{ nowStr }}
      </div>
    </div>

    <div class="actions">
      <el-button round type="success" plain @click="goPos"> POS </el-button>

      <el-button round type="primary" plain @click="goEndOfDay">
        Chốt ca
      </el-button>

      <el-button round type="danger" @click="logout"> Đăng xuất </el-button>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import authService from "@/services/authService";

// Nếu bạn có store user thì có thể lấy tên nhân viên ở đây.
// Mình để shiftName dạng đơn giản.
const shiftName = computed(() => "Nhân viên");

const router = useRouter();
const route = useRoute();

const nowStr = ref("");
let timer = null;

function tick() {
  const d = new Date();
  nowStr.value = d.toLocaleString("vi-VN", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function goPos() {
  if (route.path !== "/staff/pos") router.push("/staff/pos");
}

function goEndOfDay() {
  router.push("/staff/end-of-day");
}

async function logout() {
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống POS không?",
      "Xác nhận đăng xuất",
      {
        type: "warning",
        confirmButtonText: "Đăng xuất",
        cancelButtonText: "Hủy",
        autofocus: false,
      },
    );

    await authService.logout();
    ElMessage.success("Đã đăng xuất!");
    router.push("/login");
  } catch (err) {
    if (err === "cancel" || err === "close") return;
    // fallback: ép logout phía client
    localStorage.clear();
    router.push("/login");
  }
}

onMounted(() => {
  tick();
  timer = setInterval(tick, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.staff-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.18);

  background: linear-gradient(135deg, #0f9f4a 0%, #16a34a 55%, #22c55e 100%);
  box-shadow: 0 14px 28px rgba(16, 185, 129, 0.22);
  color: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 240px;
}

.logo-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.2);
}

.brand-title {
  font-weight: 900;
  letter-spacing: 0.06em;
}

.brand-sub {
  font-size: 0.85rem;
  opacity: 0.9;
}

.center {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.pill.soft {
  background: rgba(255, 255, 255, 0.12);
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #a7f3d0;
  box-shadow: 0 0 0 6px rgba(167, 243, 208, 0.18);
}

.clock {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-weight: 800;
  letter-spacing: 0.02em;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.actions :deep(.el-button) {
  font-weight: 900;
}
</style>
