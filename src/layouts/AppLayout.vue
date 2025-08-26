<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="app-layout">
    <AppHeader />
    <div class="main-content">
      <AppSidebar />
      <div class="content">
        <!-- Nội dung của Dashboard sẽ được render ở đây -->
        <!-- <div class="test">Test render</div> -->
        <router-view />
      </div>
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
  height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
}
.main-content {
  margin-top: 60px; /* Để tránh header */
  margin-left: 250px; /* Căn chỉnh với sidebar */
  transition: margin-left 0.2s;
}

.sidebar.collapsed ~ .main-content {
  margin-left: 70px;
}

@media (max-width: 900px) {
  .main-content {
    margin-left: 0 !important;
  }
}

.content {
  flex: 1;
  width: 100vh;
  /* padding: 20px; */
}
.test {
  color: red;
  font-weight: bold;
  font-size: 20px;
  background: black;
  margin: 50px;
}
</style>
