<template>
  <div class="staff-shell">
    <StaffHeader />

    <main class="staff-main">
      <router-view />
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
      rgba(34, 197, 94, 0.18) 0%,
      transparent 60%
    ),
    radial-gradient(
      820px 480px at 90% 5%,
      rgba(16, 185, 129, 0.16) 0%,
      transparent 55%
    ),
    #f5fbf7;
}

.staff-main {
  padding: 14px 14px 18px;
}
</style>
