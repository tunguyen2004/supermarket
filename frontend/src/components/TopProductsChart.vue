<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  chartData: {
    type: Array,
    default: () => [],
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

  const labels = props.chartData.map((p) => p.name);
  const data = props.chartData.map((p) => p.quantity);

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Số lượng bán",
          data,
          backgroundColor: "#16a34a",
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: {
            callback: (v) => Number(v).toLocaleString("vi-VN"),
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
