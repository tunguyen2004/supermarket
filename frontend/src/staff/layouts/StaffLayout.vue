<template>
  <div class="h-screen w-screen bg-slate-50 overflow-hidden relative">
    <!-- content: chừa chỗ header (pt-16) + chừa sidebar (pl-16) -->
    <div class="pt-16 pl-16 h-full">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>

    <!-- sidebar nằm dưới header -->
    <aside
      class="fixed left-0 top-16 bottom-0 w-16 bg-white border-r border-slate-200 shadow-sm"
    >
      <StaffSidebar />
    </aside>
  </div>
</template>

<script setup>
import StaffSidebar from "@/staff/components/StaffSidebar.vue";
</script>
