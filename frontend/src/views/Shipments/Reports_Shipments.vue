<template>
  <div class="shipment-dashboard">
    <div class="shipment-header">
      <h2>Tổng quan vận chuyển</h2>
      <div class="shipment-filters">
        <el-dropdown trigger="click" @command="handleDateChange">
          <div class="filter-btn">
            <span class="icon">📅</span>
            {{ filters.date.label }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="7d">7 ngày qua</el-dropdown-item>
              <el-dropdown-item command="30d">30 ngày qua</el-dropdown-item>
              <el-dropdown-item command="this_month"
                >Tháng này</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click" @command="handleBranchChange">
          <div class="filter-btn">
            {{ selectedBranchLabel }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="null"
                >Tất cả chi nhánh</el-dropdown-item
              >
              <el-dropdown-item
                v-for="store in stores"
                :key="store.id"
                :command="store.id"
              >
                {{ store.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <button class="btn-connect">
          <span style="font-size: 1.2em; margin-right: 4px">➕</span>
          Kết nối vận chuyển
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-overlay">
      <i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...
    </div>

    <div class="shipment-status-cards">
      <div class="status-card" v-for="item in statusList" :key="item.label">
        <div class="status-title">{{ item.label }}</div>
        <div class="status-value">{{ item.value }}</div>
        <div class="status-cod">
          COD: <b>{{ formatCurrency(item.cod) }}</b>
        </div>
      </div>
    </div>

    <div class="shipment-reports">
      <div class="report-card">
        <div class="report-title">Thời gian lấy hàng thành công trung bình</div>
        <div class="report-content">
          <canvas ref="pickupChartRef" class="big-chart"></canvas>
        </div>
      </div>

      <div class="report-card">
        <div class="report-title">
          Thời gian giao hàng thành công trung bình
        </div>
        <div class="report-content">
          <canvas ref="deliveryChartRef" class="big-chart"></canvas>
        </div>
      </div>

      <div class="report-card">
        <div class="report-title">Tỉ lệ giao hàng thành công</div>
        <div class="report-content success-rate-content">
          <canvas ref="successPieRef" class="big-chart"></canvas>
          <div class="success-rate-info" v-if="reportData.successRate">
            <div class="rate-number">{{ reportData.successRate.rate }}%</div>
            <div class="rate-detail">
              {{ reportData.successRate.delivered }}/{{
                reportData.successRate.total
              }}
              đơn giao thành công
            </div>
          </div>
        </div>
      </div>

      <div class="report-card">
        <div class="report-title">Tỉ trọng vận đơn theo khối lượng</div>
        <div class="report-content">
          <canvas ref="weightPieRef" class="big-chart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onActivated } from "vue";
import { Chart, registerables } from "chart.js";
import { ArrowDown } from "@element-plus/icons-vue";
import shipmentService from "@/services/shipmentService";
import apiClient from "@/config/axios";
import formatCurrency from "@/utils/formatCurrency";

Chart.register(...registerables);

// --- STATE ---
const filters = reactive({
  date: { key: "7d", label: "7 ngày qua" },
  store_id: null,
});

const loading = ref(false);
const statusList = ref([]);
const stores = ref([]);
const reportData = ref({});
const chartInstances = {};

const selectedBranchLabel = computed(() => {
  if (!filters.store_id) return "Tất cả chi nhánh";
  const s = stores.value.find((st) => st.id === filters.store_id);
  return s ? s.name : "Tất cả chi nhánh";
});

// --- REFS CHO CANVAS ---
const pickupChartRef = ref(null);
const deliveryChartRef = ref(null);
const successPieRef = ref(null);
const weightPieRef = ref(null);

// --- DATE RANGE HELPER ---
const getDateRange = () => {
  const now = new Date();
  let from;
  const to = now.toISOString().split("T")[0];

  switch (filters.date.key) {
    case "30d":
      from = new Date(now - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      break;
    case "this_month":
      from = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      break;
    default: // 7d
      from = new Date(now - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
  }
  return { from, to };
};

// --- FETCH STORES ---
const fetchStores = async () => {
  try {
    const res = await apiClient.get("/api/stores");
    if (res.data.success) {
      stores.value = res.data.data.filter((s) => s.is_active);
    }
  } catch (err) {
    console.error("Error loading stores:", err);
  }
};

// --- FETCH REPORT DATA ---
const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const { from, to } = getDateRange();
    const params = { from, to };
    if (filters.store_id) params.store_id = filters.store_id;

    const res = await shipmentService.getReportDashboard(params);
    if (res.success) {
      const data = res.data;
      reportData.value = data;
      statusList.value = data.statusCards || [];

      // Update charts
      renderBarChart(chartInstances.pickup, data.avgPickup);
      renderBarChart(chartInstances.delivery, data.avgDelivery);

      if (data.successRate) {
        updateChartData(chartInstances.success, [
          data.successRate.delivered,
          data.successRate.failed + data.successRate.returnedCancelled,
        ]);
      }
      if (data.weightDistribution) {
        // Rebuild weight chart with dynamic labels
        if (chartInstances.weight) chartInstances.weight.destroy();
        chartInstances.weight = createChart(
          weightPieRef.value,
          "doughnut",
          {
            labels: data.weightDistribution.labels,
            datasets: [
              {
                data: data.weightDistribution.data,
                backgroundColor: ["#42a5f5", "#ffa726", "#ef5350"],
              },
            ],
          },
          {
            plugins: { legend: { display: true, position: "bottom" } },
            cutout: "70%",
          },
        );
      }
    }
  } catch (error) {
    console.error("Error loading shipment report:", error);
  } finally {
    loading.value = false;
  }
};

// --- CHART HELPERS ---
const initCharts = () => {
  chartInstances.pickup = createChart(
    pickupChartRef.value,
    "bar",
    {
      labels: [],
      datasets: [
        {
          label: "Thời gian lấy hàng (phút)",
          data: [],
          backgroundColor: [
            "#42a5f5",
            "#90caf9",
            "#bbdefb",
            "#e3f2fd",
            "#64b5f6",
          ],
        },
      ],
    },
    {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Phút" },
        },
      },
    },
  );

  chartInstances.delivery = createChart(
    deliveryChartRef.value,
    "bar",
    {
      labels: [],
      datasets: [
        {
          label: "Thời gian giao hàng (phút)",
          data: [],
          backgroundColor: [
            "#66bb6a",
            "#a5d6a7",
            "#c8e6c9",
            "#e8f5e9",
            "#81c784",
          ],
        },
      ],
    },
    {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Phút" },
        },
      },
    },
  );

  chartInstances.success = createChart(
    successPieRef.value,
    "doughnut",
    {
      labels: ["Thành công", "Thất bại/Hoàn"],
      datasets: [{ data: [], backgroundColor: ["#42a5f5", "#e0e0e0"] }],
    },
    {
      plugins: { legend: { display: true, position: "bottom" } },
      cutout: "70%",
    },
  );

  chartInstances.weight = createChart(
    weightPieRef.value,
    "doughnut",
    {
      labels: [],
      datasets: [
        { data: [], backgroundColor: ["#42a5f5", "#ffa726", "#ef5350"] },
      ],
    },
    {
      plugins: { legend: { display: true, position: "bottom" } },
      cutout: "70%",
    },
  );
};

const createChart = (canvasRef, type, data, options) => {
  if (!canvasRef) return null;
  return new Chart(canvasRef, {
    type,
    data,
    options: { responsive: true, maintainAspectRatio: false, ...options },
  });
};

const updateChartData = (chart, newData) => {
  if (!chart) return;
  chart.data.datasets[0].data = newData;
  chart.update();
};

const renderBarChart = (chart, apiData) => {
  if (!chart || !apiData) return;
  chart.data.labels = apiData.labels;
  chart.data.datasets[0].data = apiData.data;
  chart.update();
};

// --- EVENT HANDLERS ---
const handleDateChange = (command) => {
  const labels = {
    "7d": "7 ngày qua",
    "30d": "30 ngày qua",
    this_month: "Tháng này",
  };
  filters.date = { key: command, label: labels[command] };
  fetchDashboardData();
};

const handleBranchChange = (command) => {
  filters.store_id = command;
  fetchDashboardData();
};

// --- LIFECYCLE ---
onMounted(async () => {
  await fetchStores();
  initCharts();
  await fetchDashboardData();
});

// Re-fetch data when component is re-activated (keep-alive) or navigated back
onActivated(async () => {
  await fetchDashboardData();
});

onUnmounted(() => {
  Object.values(chartInstances).forEach((chart) => {
    if (chart) chart.destroy();
  });
});
</script>

<style scoped>
.shipment-dashboard {
  max-width: 1300px;
  margin: auto;
  padding: 24px;
  background: #f8f9fb;
  font-family: "Inter", sans-serif;
}
.shipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}
.shipment-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #222;
}
.shipment-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.filter-btn {
  background: #fff;
  border: 1px solid #d1d5db;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #374151;
}
.filter-btn .icon {
  color: #6b7280;
}
.btn-connect {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.btn-connect:hover {
  background: #1d4ed8;
}
.shipment-status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.status-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.status-title {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}
.status-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}
.status-cod {
  font-size: 0.9rem;
  color: #374151;
}
.status-cod::before {
  content: "💰"; /* Emoji tiền */
  margin-right: 4px;
}
.shipment-reports {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 18px;
}
.report-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 18px;
  display: flex;
  flex-direction: column;
  min-height: 350px;
}
.report-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
}
.report-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.big-chart {
  max-height: 280px;
}

/* Responsive */
@media (max-width: 900px) {
  .shipment-reports {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .shipment-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .shipment-filters {
    width: 100%;
  }
  .btn-connect {
    width: 98%;
    justify-content: center;
  }
}

.loading-overlay {
  text-align: center;
  padding: 24px;
  color: #6b7280;
  font-size: 1rem;
}
.loading-overlay i {
  margin-right: 8px;
}
.success-rate-content {
  flex-direction: column;
  gap: 8px;
}
.success-rate-info {
  text-align: center;
}
.rate-number {
  font-size: 2rem;
  font-weight: 700;
  color: #42a5f5;
}
.rate-detail {
  font-size: 0.9rem;
  color: #6b7280;
}
</style>
