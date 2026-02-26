<!-- src/App.vue -->
<template>
  <div id="app-root">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <!-- Chatbot Widget - hiển thị ở mọi trang -->
    <ChatbotWidget />
  </div>
</template>

<script setup>
import ChatbotWidget from './components/ChatbotWidget.vue'
</script>

<style>
/* Route transition styles are in main.css */
</style>
