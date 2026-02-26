<!-- src/views/DashboardOverview.vue -->
<template>
  <div class="dashboard-overview">
    <div class="welcome-banner">
      <img
        src="https://img.icons8.com/color/96/000000/shop.png"
        alt="MiniMart"
      />
      <div>
        <h1>
          Xin chào, <span class="brand">{{ user?.full_name || "Admin" }}</span
          >!
        </h1>
        <p>
          Chúc bạn một ngày làm việc hiệu quả. Dưới đây là tình hình kinh doanh
          hôm nay.
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <!-- Doanh thu -->
      <div class="stat-card">
        <div class="stat-icon revenue">
          <i class="fa-solid fa-sack-dollar"></i>
        </div>
        <div class="stat-info">
          <h3>Doanh thu</h3>
          <p class="stat-value">
            {{ formatCurrency(stats.revenue?.current) }}
          </p>
          <div class="stat-trend">
            <span :class="getTrendClass(stats.revenue?.change)">
              <i :class="getTrendIcon(stats.revenue?.change)"></i>
              {{ Math.abs(stats.revenue?.change || 0) }}%
            </span>
            <span class="text-muted"> so với kỳ trước</span>
          </div>
        </div>
      </div>

      <!-- Đơn hàng -->
      <div class="stat-card">
        <div class="stat-icon orders">
          <i class="fa-solid fa-file-invoice-dollar"></i>
        </div>
        <div class="stat-info">
          <h3>Đơn hàng</h3>
          <p class="stat-value">{{ stats.orders?.current || 0 }}</p>
          <div class="stat-trend">
            <span :class="getTrendClass(stats.orders?.change)">
              <i :class="getTrendIcon(stats.orders?.change)"></i>
              {{ Math.abs(stats.orders?.change || 0) }}%
            </span>
            <span class="text-muted"> so với kỳ trước</span>
          </div>
        </div>
      </div>

      <!-- Khách hàng mới -->
      <div class="stat-card">
        <div class="stat-icon customers">
          <i class="fa-solid fa-user-plus"></i>
        </div>
        <div class="stat-info">
          <h3>Khách mới</h3>
          <p class="stat-value">{{ stats.newCustomers?.current || 0 }}</p>
          <div class="stat-trend">
            <span :class="getTrendClass(stats.newCustomers?.change)">
              <i :class="getTrendIcon(stats.newCustomers?.change)"></i>
              {{ Math.abs(stats.newCustomers?.change || 0) }}%
            </span>
            <span class="text-muted"> so với kỳ trước</span>
          </div>
        </div>
      </div>

      <!-- Giá trị TB -->
      <div class="stat-card">
        <div class="stat-icon avg">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <div class="stat-info">
          <h3>Giá trị đơn TB</h3>
          <p class="stat-value">
            {{ formatCurrency(stats.avgOrderValue?.current) }}
          </p>
          <div class="stat-trend">
            <span :class="getTrendClass(stats.avgOrderValue?.change)">
              <i :class="getTrendIcon(stats.avgOrderValue?.change)"></i>
              {{ Math.abs(stats.avgOrderValue?.change || 0) }}%
            </span>
            <span class="text-muted"> so với kỳ trước</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-row">
      <div class="chart-container main-chart">
        <div class="card-header">
          <h3>Biểu đồ doanh thu & Đơn hàng</h3>
          <select v-model="chartGroupBy" @change="fetchRevenueChart">
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
          </select>
        </div>
        <div class="chart-body">
          <canvas ref="revenueChartCanvas"></canvas>
        </div>
      </div>
      <div class="chart-container side-chart">
        <div class="card-header">
          <h3>Kênh bán hàng</h3>
        </div>
        <div class="chart-body">
          <canvas ref="salesChannelCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid two-columns">
      <!-- Recent Orders -->
      <div class="data-card">
        <div class="card-header">
          <h3>Đơn hàng gần đây</h3>
          <a href="#" @click.prevent="$router.push('/orders')">Xem tất cả</a>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td class="code">{{ order.order_code }}</td>
                <td>{{ order.customer_name }}</td>
                <td class="bold">{{ formatCurrency(order.total_amount) }}</td>
                <td>
                  <span :class="['status-badge', order.status]">
                    {{ formatOrderStatus(order.status) }}
                  </span>
                </td>
              </tr>
              <tr v-if="recentOrders.length === 0">
                <td colspan="4" class="text-center">Chưa có đơn hàng nào</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock -->
      <div class="data-card">
        <div class="card-header warning">
          <h3>Cảnh báo tồn kho</h3>
          <span class="badge-count">{{ lowStock.length }}</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Tồn</th>
                <th>Ngưỡng</th>
                <th>TT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowStock" :key="item.id">
                <td>
                  <div class="product-mini">
                    <span class="product-name">{{ item.name }}</span>
                    <small class="product-code">{{ item.code }}</small>
                  </div>
                </td>
                <td class="bold text-danger">{{ item.currentStock }}</td>
                <td class="text-muted">{{ item.threshold }}</td>
                <td>
                  <span
                    class="status-dot"
                    :class="item.status"
                    :title="item.status"
                  ></span>
                </td>
              </tr>
              <tr v-if="lowStock.length === 0">
                <td colspan="4" class="text-center">Kho hàng ổn định</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="content-grid two-columns">
      <!-- Top Products -->
      <div class="data-card">
        <div class="card-header">
          <h3>Top sản phẩm bán chạy</h3>
        </div>
        <div class="list-group">
          <div
            v-for="(prod, idx) in topProducts"
            :key="prod.id"
            class="list-item"
          >
            <div class="rank">{{ idx + 1 }}</div>
            <div class="item-info">
              <span class="item-name">{{ prod.name }}</span>
              <small class="item-sub">{{ prod.totalSold }} đã bán</small>
            </div>
            <div class="item-value">
              {{ formatCurrency(prod.revenue) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Top Customers -->
      <div class="data-card">
        <div class="card-header">
          <h3>Khách hàng thân thiết</h3>
        </div>
        <div class="list-group">
          <div
            v-for="(cust, idx) in topCustomers"
            :key="cust.id"
            class="list-item"
          >
            <div class="avatar-circle">
              {{ getInitials(cust.name) }}
            </div>
            <div class="item-info">
              <span class="item-name">{{ cust.name }}</span>
              <small class="item-sub">{{ cust.totalOrders }} đơn hàng</small>
            </div>
            <div class="item-value">
              {{ formatCurrency(cust.totalSpent) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import Chart from "chart.js/auto";
import dashboardService from "@/services/dashboardService";
import formatCurrency from "@/utils/formatCurrency";
import { useAuth } from "@/composables/useAuth";

export default {
  name: "DashboardOverview",
  setup() {
    const { user } = useAuth();
    // Data State
    const overview = ref({});
    const stats = ref({});
    const recentOrders = ref([]);
    const topProducts = ref([]);
    const topCustomers = ref([]);
    const lowStock = ref([]);
    const chartGroupBy = ref("day");

    // References for Charts
    const revenueChartCanvas = ref(null);
    const salesChannelCanvas = ref(null);
    let revenueChartInstance = null;
    let salesChannelChartInstance = null;

    // Filter Dates (Default current month)
    const getDates = () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of month or today? Usually today for realism
      // Format YYYY-MM-DD
      const formatDate = (d) => d.toISOString().split("T")[0];
      return {
        from: formatDate(firstDay),
        to: formatDate(now), // or lastDay
      };
    };

    const dates = getDates();

    // Fetch Methods
    const fetchAllData = async () => {
      try {
        // Parallel requests
        const [
          overviewRes,
          statsRes,
          topProdRes,
          topCustRes,
          lowStockRes,
        ] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getStats({ ...dates }),
          dashboardService.getTopProducts({ ...dates, limit: 5 }),
          dashboardService.getTopCustomers({ ...dates, limit: 5 }),
          dashboardService.getLowStock({ limit: 5 }),
        ]);

        if (overviewRes.data.success) {
          overview.value = overviewRes.data.data;
          recentOrders.value = overviewRes.data.data.recentOrders || [];
        }

        if (statsRes.data.success) {
          stats.value = statsRes.data.data;
        }

        if (topProdRes.data.success) {
          topProducts.value = topProdRes.data.data;
        }

        if (topCustRes.data.success) {
          topCustomers.value = topCustRes.data.data;
        }

        if (lowStockRes.data.success) {
          lowStock.value = lowStockRes.data.data;
        }

        // Charts need to be rendered after data
        await fetchRevenueChart();
        await fetchSalesChannels();
      } catch (error) {
        console.error("Error loading dashboard data", error);
      }
    };

    const fetchRevenueChart = async () => {
      try {
        const res = await dashboardService.getRevenueChart({
          ...dates,
          groupBy: chartGroupBy.value,
        });
        if (res.data.success) {
          renderRevenueChart(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchSalesChannels = async () => {
      try {
        const res = await dashboardService.getSalesChannels({ ...dates });
        if (res.data.success) {
          renderSalesChannelChart(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Render Charts
    const renderRevenueChart = (data) => {
      if (revenueChartInstance) {
        revenueChartInstance.destroy();
      }
      if (!revenueChartCanvas.value) return;

      const ctx = revenueChartCanvas.value.getContext("2d");
      revenueChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: "Doanh thu",
              data: data.datasets[0].data,
              borderColor: "#2196f3",
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              tension: 0.4,
              fill: true,
              yAxisID: "y",
            },
            {
              label: "Đơn hàng",
              data: data.datasets[1].data,
              borderColor: "#ff9800",
              backgroundColor: "transparent",
              borderDash: [5, 5],
              tension: 0.4,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left",
              title: { display: true, text: "Doanh thu (VNĐ)" },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              grid: {
                drawOnChartArea: false,
              },
              title: { display: true, text: "Số đơn" },
            },
          },
        },
      });
    };

    const renderSalesChannelChart = (data) => {
      if (salesChannelChartInstance) {
        salesChannelChartInstance.destroy();
      }
      if (!salesChannelCanvas.value) return;

      const ctx = salesChannelCanvas.value.getContext("2d");
      // Map data for chart js if API returns array of objects
      let labels = [];
      let values = [];
      
      if (Array.isArray(data)) {
        labels = data.map((d) => d.channel);
        values = data.map((d) => d.revenue);
      }

      salesChannelChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: values,
              backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#f44336"],
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
          },
        },
      });
    };

    // Helpers
    const getTrendClass = (change) => {
      if (!change) return "";
      return change > 0 ? "trend-up" : "trend-down";
    };

    const getTrendIcon = (change) => {
      if (!change) return "fa-solid fa-minus";
      return change > 0
        ? "fa-solid fa-arrow-trend-up"
        : "fa-solid fa-arrow-trend-down";
    };

    const formatOrderStatus = (status) => {
      const map = {
        completed: "Hoàn thành",
        pending: "Chờ xử lý",
        cancelled: "Đã hủy",
        processing: "Đang giao",
      };
      return map[status] || status;
    };

    const getInitials = (name) => {
      if (!name) return "";
      return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    };

    onMounted(() => {
      fetchAllData();
    });

    return {
      user,
      stats,
      recentOrders,
      topProducts,
      topCustomers,
      lowStock,
      formatCurrency,
      getTrendClass,
      getTrendIcon,
      formatOrderStatus,
      getInitials,
      revenueChartCanvas,
      salesChannelCanvas,
      chartGroupBy,
      fetchRevenueChart,
    };
  },
};
</script>

<style scoped>
.dashboard-overview {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: var(--app-bg, #f4f6fa);
  min-height: 100vh;
}

.dashboard-overview > * {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.dashboard-overview > *:nth-child(1) { animation-delay: 0ms; }
.dashboard-overview > *:nth-child(2) { animation-delay: 60ms; }
.dashboard-overview > *:nth-child(3) { animation-delay: 120ms; }
.dashboard-overview > *:nth-child(4) { animation-delay: 180ms; }
.dashboard-overview > *:nth-child(5) { animation-delay: 240ms; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-banner {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
  color: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.welcome-banner img {
  width: 64px;
  height: 64px;
  margin-right: 20px;
  z-index: 2;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.welcome-banner h1 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.welcome-banner p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.welcome-banner .brand {
  color: #fff;
  font-weight: 800;
  text-transform: uppercase;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-icon.revenue {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.stat-icon.orders {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.stat-icon.customers {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.stat-icon.avg {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.stat-info h3 {
  margin: 0 0 4px 0;
  color: #78909c;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #263238;
}

.stat-trend {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #4caf50;
  font-weight: 600;
}

.trend-down {
  color: #f44336;
  font-weight: 600;
}

.text-muted {
  color: #90a4ae;
}

/* Charts Row */
.charts-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-container {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: box-shadow 0.3s;
}

.chart-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.main-chart {
  flex: 3;
  min-height: 400px;
}

.side-chart {
  flex: 1;
  min-height: 400px;
}

.chart-body {
  flex: 1;
  position: relative;
  min-height: 0;
}

/* Content Grid */
.content-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.two-columns {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.data-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: box-shadow 0.3s;
}

.data-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eceff1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #37474f;
  font-weight: 600;
}

.card-header a {
  font-size: 0.9rem;
  color: #2196f3;
  text-decoration: none;
  font-weight: 500;
}

.card-header select {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #cfd8dc;
  color: #546e7a;
  font-size: 0.9rem;
  outline: none;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f9fafb;
  color: #78909c;
  font-weight: 600;
  font-size: 0.85rem;
  text-align: left;
  padding: 12px 20px;
  border-bottom: 1px solid #eceff1;
}

.data-table td {
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.data-table tr:hover td {
  background: #f8fafc;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.code {
  font-family: monospace;
  color: #2196f3;
  font-weight: 600;
}

.bold {
  font-weight: 600;
}

/* Status Badges */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.pending {
  background: #fff8e1;
  color: #f57f17;
}

.status-badge.cancelled {
  background: #ffebee;
  color: #c62828;
}

.status-badge.processing {
  background: #e3f2fd;
  color: #1565c0;
}

/* Low Stock Table Specifics */
.product-mini {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 500;
}

.product-code {
  font-size: 0.8rem;
  color: #90a4ae;
}

.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.critical {
  background: #f44336;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.2);
}

.status-dot.warning {
  background: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.2);
}

.badge-count {
  background: #f44336;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* List Group */
.list-group {
  padding: 0;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.list-item:hover {
  background: #f8fafc;
}

.list-item:last-child {
  border-bottom: none;
}

.rank {
  width: 24px;
  height: 24px;
  background: #eceff1;
  color: #546e7a;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-size: 0.85rem;
  font-weight: bold;
  margin-right: 12px;
}

.list-item:nth-child(1) .rank {
  background: #fff8e1;
  color: #ffc107;
}
.list-item:nth-child(2) .rank {
  background: #eceff1;
  color: #90a4ae;
}
.list-item:nth-child(3) .rank {
  background: #fbe9e7;
  color: #ff7043;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 600;
  color: #37474f;
  margin-bottom: 2px;
}

.item-sub {
  font-size: 0.85rem;
  color: #90a4ae;
}

.item-value {
  font-weight: 600;
  color: #263238;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  font-size: 0.9rem;
}

/* Responsiveness */
@media (max-width: 900px) {
  .charts-row {
    flex-direction: column;
  }
  .main-chart,
  .side-chart {
    min-height: 300px;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .two-columns {
    grid-template-columns: 1fr;
  }
  .welcome-banner {
    flex-direction: column;
    text-align: center;
  }
  .welcome-banner img {
    margin-right: 0;
    margin-bottom: 12px;
  }
}
</style>
