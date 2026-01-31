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
      <!-- Green payment button -->
      <button
        class="w-12 h-12 rounded-xl bg-green-500 hover:bg-green-600 transition grid place-items-center shadow-sm"
        title="Nhập hàng"
      >
        <span class="text-white text-xl">💰</span>
      </button>

      <!-- Settings button -->
      <button
        class="w-12 h-12 rounded-xl grid place-items-center text-slate-500 hover:bg-slate-100 transition"
        title="Cài đặt"
      >
        <span class="text-2xl"><i class="fa-solid fa-gear"></i></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();

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
</script>
