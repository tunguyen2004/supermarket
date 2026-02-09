<!-- src/App.vue -->
<template>
  <div>
    <router-view />
    <!-- Chatbot Widget - hiển thị ở mọi trang -->
    <ChatbotWidget />
  </div>
</template>

<script setup>
import ChatbotWidget from './components/ChatbotWidget.vue'
// Không cần logic ở đây vì router sẽ xử lý layout và view
// Các global state hoặc logic (nếu có) nên được quản lý trong store hoặc composables
</script>

<style scoped>
/* Style scoped để tránh ảnh hưởng global không mong muốn */
/* Nếu cần style global, nên đặt trong src/style/main.css và import vào main.js */
:deep(html, body) {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f8f8;
}
</style>
<style>
body {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "San Francisco",
    "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}
</style>
