<template>
    <div class="auth-layout">
    <div class="auth-container">
        <!-- Phần này sẽ render nội dung con, như Login.vue -->
        <router-view />
    </div>
    </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f4f4;
}

.auth-container {
  background: white;
  /* padding: 2rem; */
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
