<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="app-layout">
    <AppHeader />
    <div class="main-content">
      <AppSidebar />
      <main class="content">
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import AppSidebar from "@/components/AppSidebar.vue";
import AppHeader from "@/components/AppHeader.vue";

export default {
  name: "AppLayout",
  components: {
    AppSidebar,
    AppHeader,
  },
};
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--app-bg, #f4f6fa);
}

.main-content {
  display: flex;
  flex: 1;
  margin-top: 60px;
  margin-left: 260px;
  transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.sidebar.collapsed ~ .main-content {
  margin-left: 80px;
}

@media (max-width: 900px) {
  .main-content {
    margin-left: 0 !important;
  }
}

.content {
  flex: 1;
  min-width: 0;
  min-height: calc(100vh - 60px);
}

/* Page transitions */
.page-enter-active {
  animation: fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-leave-active {
  animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
