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
    type: 'bar',
    data: {
      labels: ['Mì Hảo Hảo', 'Trứng gà', 'Bột ngọt Ajinomoto', 'Dầu ăn Tường An', 'Nước mắm Nam Ngư'],
      datasets: [{
        label: 'Số lượng bán',
        data: [1200, 950, 800, 700, 600],
        backgroundColor: '#16a34a',
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
});
</script>
