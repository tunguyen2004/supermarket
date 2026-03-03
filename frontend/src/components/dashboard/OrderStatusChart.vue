<!-- 
  OrderStatusChart.vue
  Biểu đồ Doughnut nhỏ: phân bổ trạng thái đơn hàng
  Props: chartData = [{ status, label, count }]
-->
<template>
  <div class="chart-wrapper">
    <canvas ref="canvasRef"></canvas>
    <div class="chart-center" v-if="totalOrders > 0">
      <span class="center-value">{{ totalOrders }}</span>
      <span class="center-label">đơn hàng</span>
    </div>
    <div v-if="!hasData" class="chart-empty">
      <i class="fa-solid fa-clipboard-list"></i>
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

const statusColors = {
  completed: "#4ade80",
  pending: "#fbbf24",
  processing: "#60a5fa",
  cancelled: "#f87171",
};

const hasData = computed(() => props.chartData?.length > 0);
const totalOrders = computed(() =>
  props.chartData.reduce((sum, d) => sum + d.count, 0),
);

const renderChart = () => {
  if (chartInstance) chartInstance.destroy();
  if (!canvasRef.value || !hasData.value) return;

  const ctx = canvasRef.value.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: props.chartData.map((d) => d.label),
      datasets: [
        {
          data: props.chartData.map((d) => d.count),
          backgroundColor: props.chartData.map(
            (d) => statusColors[d.status] || "#94a3b8",
          ),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 12,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const item = props.chartData[ctx.dataIndex];
              const pct = totalOrders.value
                ? ((item.count / totalOrders.value) * 100).toFixed(1)
                : 0;
              return ` ${item.label}: ${item.count} (${pct}%)`;
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
.chart-center {
  position: absolute;
  top: 42%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
.center-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
}
.center-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
