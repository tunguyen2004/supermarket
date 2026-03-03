<!-- 
  RevenueOrderChart.vue
  Biểu đồ đường kép: Doanh thu (trục trái) + Số đơn hàng (trục phải)
  Props: chartData = { labels, datasets: [{ data }, { data }] }
-->
<template>
  <div class="chart-wrapper">
    <canvas ref="canvasRef"></canvas>
    <div v-if="!hasData" class="chart-empty">
      <i class="fa-solid fa-chart-line"></i>
      <p>Chưa có dữ liệu biểu đồ</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  chartData: { type: Object, default: () => ({}) },
});

const canvasRef = ref(null);
let chartInstance = null;

const hasData = computed(() => {
  return (
    props.chartData?.labels?.length > 0 &&
    props.chartData?.datasets?.length >= 2
  );
});

const renderChart = () => {
  if (chartInstance) chartInstance.destroy();
  if (!canvasRef.value || !hasData.value) return;

  const ctx = canvasRef.value.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: props.chartData.labels,
      datasets: [
        {
          label: "Doanh thu",
          data: props.chartData.datasets[0].data,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          tension: 0.4,
          fill: true,
          yAxisID: "y",
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        },
        {
          label: "Đơn hàng",
          data: props.chartData.datasets[1].data,
          borderColor: "#f59e0b",
          backgroundColor: "transparent",
          borderDash: [6, 4],
          tension: 0.4,
          yAxisID: "y1",
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { size: 13 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleFont: { size: 13 },
          bodyFont: { size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              if (ctx.datasetIndex === 0) {
                return ` Doanh thu: ${Number(ctx.raw).toLocaleString(
                  "vi-VN",
                )} ₫`;
              }
              return ` Đơn hàng: ${ctx.raw}`;
            },
          },
        },
      },
      scales: {
        y: {
          type: "linear",
          position: "left",
          title: { display: true, text: "Doanh thu (VNĐ)", font: { size: 12 } },
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: {
            callback: (v) =>
              v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v.toLocaleString(),
          },
        },
        y1: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Số đơn", font: { size: 12 } },
        },
        x: {
          grid: { display: false },
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
  min-height: 300px;
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
