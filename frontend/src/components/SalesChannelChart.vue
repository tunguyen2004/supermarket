<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';

const chartCanvas = ref(null);

onMounted(() => {
  const ctx = chartCanvas.value.getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Tại cửa hàng', 'Giao hàng', 'ShopeeFood', 'GrabMart'],
      datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: ['#3b82f6', '#16a34a', '#f97316', '#8b5cf6'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        }
      }
    }
  });
});
</script>
