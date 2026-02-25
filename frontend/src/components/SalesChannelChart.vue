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

const COLORS = [
  "#3b82f6",
  "#16a34a",
  "#f97316",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

function renderChart() {
  if (!chartCanvas.value) return;
  const ctx = chartCanvas.value.getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = props.chartData.map((d) => d.channel);
  const data = props.chartData.map((d) => d.percentage || d.revenue);

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: COLORS.slice(0, labels.length),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const item = props.chartData[ctx.dataIndex];
              if (item?.revenue) {
                return `${ctx.label}: ${Number(item.revenue).toLocaleString(
                  "vi-VN",
                )}đ (${item.percentage}%)`;
              }
              return `${ctx.label}: ${ctx.parsed}%`;
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
