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
            {{ filters.branch || "Tất cả chi nhánh" }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="null"
                >Tất cả chi nhánh</el-dropdown-item
              >
              <el-dropdown-item command="Chi nhánh Quận 1"
                >Chi nhánh Quận 1</el-dropdown-item
              >
              <el-dropdown-item command="Chi nhánh Quận 3"
                >Chi nhánh Quận 3</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <button class="btn-connect">
          <span style="font-size: 1.2em; margin-right: 4px">➕</span>
          Kết nối vận chuyển
        </button>
      </div>
    </div>

    <div class="shipment-status-cards">
      <div class="status-card" v-for="item in statusList" :key="item.label">
        <div class="status-title">{{ item.label }}</div>
        <div class="status-value">{{ item.value }}</div>
        <div class="status-cod">
          COD: <b>{{ item.cod }}</b>
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
        <div class="report-content">
          <canvas ref="successPieRef" class="big-chart"></canvas>
        </div>
      </div>

      <div class="report-card">
        <div class="report-title">Tỉ trọng vận đơn</div>
        <div class="report-content">
          <canvas ref="weightPieRef" class="big-chart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";
import { ArrowDown } from "@element-plus/icons-vue"; // Import icon
Chart.register(...registerables);

// --- STATE QUẢN LÝ ---
const filters = reactive({
  date: { key: "7d", label: "7 ngày qua" },
  branch: null,
});

const statusList = ref([]);
const chartInstances = {}; // Lưu trữ các đối tượng chart

// --- REFS CHO CANVAS ---
const pickupChartRef = ref(null);
const deliveryChartRef = ref(null);
const successPieRef = ref(null);
const weightPieRef = ref(null);

// --- HÀM GIẢ LẬP LẤY DỮ LIỆU ---
const fetchDashboardData = async () => {
  console.log("Đang lấy dữ liệu mới với bộ lọc:", filters);
  // Giả lập độ trễ mạng
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Tạo dữ liệu ngẫu nhiên
  statusList.value = [
    {
      label: "Chờ lấy hàng",
      value: Math.floor(Math.random() * 10),
      cod: `${(Math.random() * 2000).toFixed(0)}.000đ`,
    },
    {
      label: "Đã lấy hàng",
      value: Math.floor(Math.random() * 20),
      cod: `${(Math.random() * 5000).toFixed(0)}.000đ`,
    },
    {
      label: "Đang giao hàng",
      value: Math.floor(Math.random() * 15),
      cod: `${(Math.random() * 4000).toFixed(0)}.000đ`,
    },
    {
      label: "Chờ giao lại",
      value: Math.floor(Math.random() * 5),
      cod: `${(Math.random() * 1000).toFixed(0)}.000đ`,
    },
    {
      label: "Đang hoàn hàng",
      value: Math.floor(Math.random() * 3),
      cod: `${(Math.random() * 500).toFixed(0)}.000đ`,
    },
  ];

  const randomBarData1 = [
    Math.floor(Math.random() * 20 + 30),
    Math.floor(Math.random() * 20 + 30),
    Math.floor(Math.random() * 20 + 30),
  ];
  const randomBarData2 = [
    Math.floor(Math.random() * 20 + 50),
    Math.floor(Math.random() * 20 + 50),
    Math.floor(Math.random() * 20 + 50),
  ];
  const randomPieData1 = Math.floor(Math.random() * 10 + 85);
  const randomPieData2 = Math.floor(Math.random() * 50 + 50);

  // Cập nhật dữ liệu cho các biểu đồ
  updateChartData(chartInstances.pickup, randomBarData1);
  updateChartData(chartInstances.delivery, randomBarData2);
  updateChartData(chartInstances.success, [
    randomPieData1,
    100 - randomPieData1,
  ]);
  updateChartData(chartInstances.weight, [
    randomPieData2,
    150 - randomPieData2,
  ]);
};

// --- LOGIC BIỂU ĐỒ ---
const initCharts = () => {
  chartInstances.pickup = createChart(
    pickupChartRef.value,
    "bar",
    {
      labels: ["CN1", "CN2", "CN3"],
      datasets: [
        {
          label: "Lấy hàng (phút)",
          data: [],
          backgroundColor: ["#42a5f5", "#90caf9", "#e3f2fd"],
        },
      ],
    },
    {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    }
  );

  chartInstances.delivery = createChart(
    deliveryChartRef.value,
    "bar",
    {
      labels: ["CN1", "CN2", "CN3"],
      datasets: [
        {
          label: "Giao hàng (phút)",
          data: [],
          backgroundColor: ["#66bb6a", "#a5d6a7", "#e8f5e9"],
        },
      ],
    },
    {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    }
  );

  chartInstances.success = createChart(
    successPieRef.value,
    "doughnut",
    {
      labels: ["Thành công", "Thất bại"],
      datasets: [{ data: [], backgroundColor: ["#42a5f5", "#e0e0e0"] }],
    },
    {
      plugins: { legend: { display: true, position: "bottom" } },
      cutout: "70%",
    }
  );

  chartInstances.weight = createChart(
    weightPieRef.value,
    "doughnut",
    {
      labels: ["Nặng", "Nhẹ"],
      datasets: [{ data: [], backgroundColor: ["#ffa726", "#ffe0b2"] }],
    },
    {
      plugins: { legend: { display: true, position: "bottom" } },
      cutout: "70%",
    }
  );
};

const createChart = (canvasRef, type, data, options) => {
  if (!canvasRef) return null;
  return new Chart(canvasRef, { type, data, options });
};

const updateChartData = (chart, newData) => {
  if (!chart) return;
  chart.data.datasets[0].data = newData;
  chart.update();
};

// --- HÀM XỬ LÝ SỰ KIỆN ---
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
  filters.branch = command;
  fetchDashboardData();
};

// --- VÒNG ĐỜI COMPONENT ---
onMounted(() => {
  initCharts();
  fetchDashboardData();
});

onUnmounted(() => {
  // Hủy các đối tượng chart để tránh rò rỉ bộ nhớ
  Object.values(chartInstances).forEach((chart) => {
    if (chart) {
      chart.destroy();
    }
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
</style>
