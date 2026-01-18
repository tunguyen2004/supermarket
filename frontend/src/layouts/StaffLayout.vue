<template>
    <div class="min-h-screen flex">
      <aside class="w-64 border-r p-4">
        <!-- menu staff đơn giản trước -->
        <router-link class="block mb-2" to="/staff/pos">Bán hàng</router-link>
        <router-link class="block mb-2" to="/staff/end-of-day">Tổng kết cuối ngày</router-link>
      </aside>
  
      <main class="flex-1 p-4">
        <router-view />
      </main>
    </div>
  </template>
  