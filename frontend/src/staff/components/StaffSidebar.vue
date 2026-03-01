<template>
  <nav class="h-full flex flex-col items-center py-3 gap-2 bg-slate-50">
    <!-- Main navigation items -->
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="w-12 h-12 rounded-xl grid place-items-center transition-all"
      :class="
        isActive(item.to)
          ? 'bg-blue-100 text-blue-600 shadow-sm'
          : 'text-slate-500 hover:bg-slate-100'
      "
      :title="item.label"
    >
      <i v-if="item.iconClass" :class="item.iconClass" class="text-xl"></i>
      <span v-else class="text-2xl">{{ item.icon }}</span>
    </RouterLink>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Bottom actions -->
    <div class="flex flex-col items-center gap-2 pb-2">
      <!-- Profile button -->
      <RouterLink
        to="/staff/my-profile"
        class="w-12 h-12 rounded-xl grid place-items-center transition"
        :class="
          isActive('/staff/my-profile')
            ? 'bg-blue-100 text-blue-600'
            : 'text-slate-500 hover:bg-slate-100'
        "
        title="Tài khoản"
      >
        <i class="fa-solid fa-user-circle text-2xl"></i>
      </RouterLink>

      <!-- Logout button -->
      <button
        @click="handleLogout"
        class="w-12 h-12 rounded-xl grid place-items-center text-red-500 hover:bg-red-50 transition"
        title="Đăng xuất"
      >
        <i class="fa-solid fa-right-from-bracket text-2xl"></i>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import authService from "@/services/authService";

const route = useRoute();
const router = useRouter();

const items = [
  {
    to: "/staff/pos",
    label: "Bán hàng",
    iconClass: "fa-solid fa-cart-shopping",
  },
  {
    to: "/staff/orders",
    label: "Tra cứu đơn hàng",
    iconClass: "fa-solid fa-comments",
  },
  {
    to: "/staff/inventory-lookup",
    label: "Tra cứu tồn kho",
    iconClass: "fa-solid fa-boxes-stacked",
  },
  // { to: "/staff/returns", label: "Trả hàng", icon: "↩️" },
  // { to: "/staff/documents", label: "Tài liệu", icon: "📄" },
  {
    to: "/staff/end-of-day",
    label: "Báo cáo cuối ngày",
    iconClass: "fa-solid fa-chart-column",
  },
];

const isActive = (to) => route.path.startsWith(to);

async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc chắn muốn đăng xuất?",
      "Xác nhận đăng xuất",
      {
        confirmButtonText: "Đăng xuất",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );

    authService.logout();
    router.push("/login");
    ElMessage.success("Đăng xuất thành công!");
  } catch (e) {
    // User cancelled
  }
}
</script>
