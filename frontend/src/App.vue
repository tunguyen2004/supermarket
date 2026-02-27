<!-- src/App.vue -->
<template>
  <div id="app-root">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
    <!-- Chatbot Widget - hiển thị ở mọi trang -->
    <ChatbotWidget />
  </div>
</template>

<script setup>
import ChatbotWidget from "./components/ChatbotWidget.vue";
import { SpeedInsights } from "@vercel/speed-insights/vue";
</script>

<style>
/* Route transition styles are in main.css */
</style>
