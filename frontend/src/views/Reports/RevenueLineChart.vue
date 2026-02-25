<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  chartData: {
    type: Object,
    default: () => ({ labels: [], datasets: [] }),
  },
});

const chartCanvas = ref(null);
let chartInstance = null;

function renderChart() {
  if (!chartCanvas.value) return;
  const ctx = chartCanvas.value.getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = props.chartData?.labels || [];
  const data = props.chartData?.datasets?.[0]?.data || [];

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data,
          fill: true,
          backgroundColor: "rgba(59,130,246,0.08)",
          borderColor: "#3b82f6",
          pointBackgroundColor: "#3b82f6",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ctx.parsed.y.toLocaleString("vi-VN") + "đ",
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              if (value >= 1000000) return (value / 1000000).toFixed(0) + "M";
              if (value >= 1000) return (value / 1000).toFixed(0) + "K";
              return value.toLocaleString("vi-VN") + "đ";
            },
          },
        },
      },
    },
  });
}

onMounted(() => renderChart());

watch(
  () => props.chartData,
  () => renderChart(),
  { deep: true },
);
</script>
