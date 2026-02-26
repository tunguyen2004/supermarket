<template>
  <div class="staff-shell">
    <StaffHeader />

    <main class="staff-main">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import StaffHeader from "@/components/StaffHeader.vue";
</script>

<style scoped>
.staff-shell {
  min-height: 100vh;
  background: radial-gradient(
      900px 520px at 10% 0%,
      rgba(34, 197, 94, 0.12) 0%,
      transparent 60%
    ),
    radial-gradient(
      820px 480px at 90% 5%,
      rgba(16, 185, 129, 0.1) 0%,
      transparent 55%
    ),
    #f4f6fa;
}

.staff-main {
  padding: 14px 14px 18px;
}

/* Page transitions */
.page-enter-active {
  animation: fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-leave-active {
  animation: fadeOut 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
