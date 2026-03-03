<!-- 
  SalesChannelChart.vue
  Biểu đồ Doughnut: phân bổ doanh thu theo kênh bán hàng
  Props: chartData = [{ channel, revenue, percentage }]
-->
<template>
  <div class="chart-wrapper">
    <canvas ref="canvasRef"></canvas>
    <div v-if="!hasData" class="chart-empty">
      <i class="fa-solid fa-chart-pie"></i>
      <p>Chưa có dữ liệu</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  chartData: { type: Array, default: () => [] },
});

const canvasRef = ref(null);
let chartInstance = null;

const colors = [
  "#4ade80",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#a78bfa",
  "#f472b6",
];

const hasData = computed(() => props.chartData?.length > 0);

const renderChart = () => {
  if (chartInstance) chartInstance.destroy();
  if (!canvasRef.value || !hasData.value) return;

  const ctx = canvasRef.value.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: props.chartData.map((d) => d.channel),
      datasets: [
        {
          data: props.chartData.map((d) => d.revenue),
          backgroundColor: colors.slice(0, props.chartData.length),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 14,
            font: { size: 12 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const item = props.chartData[ctx.dataIndex];
              return ` ${item.channel}: ${Number(item.revenue).toLocaleString(
                "vi-VN",
              )} ₫ (${item.percentage}%)`;
            },
          },
        },
      },
    },
  });
};

watch(() => props.chartData, renderChart, { deep: true });
onMounted(renderChart);
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 260px;
}
.chart-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 8px;
}
.chart-empty i {
  font-size: 2rem;
}
</style>
