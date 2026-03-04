<!-- src/views/DashboardOverview.vue -->
<!-- 
  Dashboard tổng quan cửa hàng — Phiên bản cải tiến:
  ✓ <script setup> (Composition API mới)
  ✓ Loading skeleton khi fetch data
  ✓ Date Range Picker (chọn khoảng ngày tuỳ ý)
  ✓ Quick Actions bar (tạo đơn, thêm SP, nhập hàng, báo cáo)
  ✓ Auto-refresh mỗi 5 phút + nút refresh thủ công
  ✓ Error state + nút Thử lại
  ✓ Card "Thống kê hôm nay" (riêng biệt)
  ✓ Biểu đồ trạng thái đơn hàng (endpoint mới)
  ✓ Tách chart thành component con
-->
<template>
  <div class="dashboard-overview">
    <!-- ============ WELCOME BANNER ============ -->
    <div class="welcome-banner">
      <img
        src="https://img.icons8.com/color/96/000000/shop.png"
        alt="MiniMart"
      />
      <div class="welcome-text">
        <h1>
          Xin chào,
          <span class="brand">{{ user?.full_name || "Admin" }}</span
          >!
        </h1>
        <p>
          Chúc bạn một ngày làm việc hiệu quả. Dưới đây là tình hình kinh doanh
          hôm nay.
        </p>
      </div>
      <div class="banner-actions">
        <button
          class="btn-refresh"
          @click="handleRefresh"
          :disabled="loading"
          title="Làm mới dữ liệu"
        >
          <i
            class="fa-solid fa-arrows-rotate"
            :class="{ spinning: loading }"
          ></i>
        </button>
        <span class="last-updated" v-if="lastUpdated">
          Cập nhật: {{ lastUpdated }}
        </span>
      </div>
    </div>

    <!-- ============ QUICK ACTIONS ============ -->
    <!-- <div class="quick-actions">
      <button class="action-btn" @click="$router.push('/pos')">
        <div class="action-icon pos">
          <i class="fa-solid fa-cash-register"></i>
        </div>
        <span>Bán hàng (POS)</span>
      </button>
      <button class="action-btn" @click="$router.push('/orders/new')">
        <div class="action-icon order">
          <i class="fa-solid fa-file-circle-plus"></i>
        </div>
        <span>Tạo đơn hàng</span>
      </button>
      <button class="action-btn" @click="$router.push('/products/new')">
        <div class="action-icon product">
          <i class="fa-solid fa-box-open"></i>
        </div>
        <span>Thêm sản phẩm</span>
      </button>
      <button class="action-btn" @click="$router.push('/receive-inventories')">
        <div class="action-icon inventory">
          <i class="fa-solid fa-truck-ramp-box"></i>
        </div>
        <span>Nhập hàng</span>
      </button>
      <button class="action-btn" @click="$router.push('/reports')">
        <div class="action-icon report">
          <i class="fa-solid fa-chart-column"></i>
        </div>
        <span>Báo cáo</span>
      </button>
    </div> -->

    <!-- ============ TODAY STATS (HIGHLIGHT) ============ -->
    <div class="today-section" v-if="!loading">
      <div class="section-label">
        <i class="fa-solid fa-calendar-day"></i> Hôm nay
        <span class="today-date">{{ todayFormatted }}</span>
      </div>
      <div class="today-grid">
        <div class="today-card">
          <div class="today-icon revenue">
            <i class="fa-solid fa-coins"></i>
          </div>
          <div class="today-info">
            <span class="today-label">Doanh thu</span>
            <span class="today-value">{{
              formatCurrency(todayStats.todayRevenue)
            }}</span>
          </div>
        </div>
        <div class="today-card">
          <div class="today-icon orders">
            <i class="fa-solid fa-receipt"></i>
          </div>
          <div class="today-info">
            <span class="today-label">Đơn hoàn thành</span>
            <span class="today-value">{{ todayStats.todayOrders || 0 }}</span>
          </div>
        </div>
        <div class="today-card">
          <div class="today-icon pending">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div class="today-info">
            <span class="today-label">Đơn chờ xử lý</span>
            <span class="today-value">{{ todayStats.pendingOrders || 0 }}</span>
          </div>
        </div>
        <div class="today-card">
          <div class="today-icon customers">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <div class="today-info">
            <span class="today-label">Khách mới</span>
            <span class="today-value">{{
              todayStats.todayNewCustomers || 0
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="today-section" v-else>
      <div class="section-label">
        <i class="fa-solid fa-calendar-day"></i> Hôm nay
      </div>
      <div class="today-grid">
        <div class="today-card skeleton-card" v-for="i in 4" :key="i">
          <div class="skeleton-circle"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line long"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ DATE PICKER + PERIOD STATS ============ -->
    <div class="filter-bar">
      <div class="filter-left">
        <h2 class="section-title">Thống kê theo kỳ</h2>
      </div>
      <div class="filter-right">
        <div class="date-picker-group">
          <label>Từ</label>
          <input type="date" v-model="dateFrom" @change="onDateChange" />
        </div>
        <div class="date-picker-group">
          <label>Đến</label>
          <input type="date" v-model="dateTo" @change="onDateChange" />
        </div>
        <div class="preset-btns">
          <button :class="{ active: preset === '7d' }" @click="setPreset('7d')">
            7 ngày
          </button>
          <button
            :class="{ active: preset === '30d' }"
            @click="setPreset('30d')"
          >
            30 ngày
          </button>
          <button
            :class="{ active: preset === 'month' }"
            @click="setPreset('month')"
          >
            Tháng này
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-banner">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>{{ error }}</span>
      <button @click="handleRefresh">Thử lại</button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid" v-if="!loading">
      <div class="stat-card" v-for="card in statCards" :key="card.key">
        <div :class="['stat-icon', card.iconClass]">
          <i :class="card.icon"></i>
        </div>
        <div class="stat-info">
          <h3>{{ card.title }}</h3>
          <p class="stat-value">{{ card.formatted }}</p>
          <div class="stat-trend">
            <span :class="getTrendClass(card.change)">
              <i :class="getTrendIcon(card.change)"></i>
              {{ Math.abs(card.change || 0) }}%
            </span>
            <span class="text-muted"> so với kỳ trước</span>
          </div>
        </div>
      </div>
    </div>
    <div class="stats-grid" v-else>
      <div class="stat-card skeleton-card" v-for="i in 4" :key="i">
        <div class="skeleton-circle big"></div>
        <div class="skeleton-lines flex1">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line medium"></div>
        </div>
      </div>
    </div>

    <!-- ============ CHARTS ============ -->
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
          <RevenueOrderChart :chartData="revenueChartData" />
        </div>
      </div>
      <div class="chart-container side-chart">
        <div class="card-header">
          <h3>Kênh bán hàng</h3>
        </div>
        <div class="chart-body">
          <SalesChannelChart :chartData="salesChannelData" />
        </div>
      </div>
    </div>

    <!-- ============ CONTENT GRID: Orders + Order Status ============ -->
    <div class="content-grid two-columns">
      <!-- Recent Orders -->
      <div class="data-card">
        <div class="card-header">
          <h3>Đơn hàng gần đây</h3>
          <a href="#" @click.prevent="$router.push('/orders')">Xem tất cả</a>
        </div>
        <div class="table-responsive" v-if="!loading">
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
        <div v-else class="skeleton-table">
          <div class="skeleton-row" v-for="i in 5" :key="i">
            <div class="skeleton-line" style="width: 60px"></div>
            <div class="skeleton-line" style="width: 100px"></div>
            <div class="skeleton-line" style="width: 80px"></div>
            <div class="skeleton-line" style="width: 70px"></div>
          </div>
        </div>
      </div>

      <!-- Order Status Breakdown (NEW) -->
      <div class="data-card">
        <div class="card-header">
          <h3>Trạng thái đơn hàng</h3>
        </div>
        <div class="chart-body compact">
          <OrderStatusChart :chartData="orderStatusData" />
        </div>
      </div>
    </div>

    <!-- ============ CONTENT GRID: Low Stock + Top Products ============ -->
    <div class="content-grid two-columns">
      <!-- Low Stock -->
      <div class="data-card">
        <div class="card-header warning">
          <h3>
            <i
              class="fa-solid fa-triangle-exclamation"
              style="color: #f59e0b; margin-right: 6px"
            ></i>
            Cảnh báo tồn kho
          </h3>
          <span class="badge-count" v-if="lowStock.length > 0">{{
            lowStock.length
          }}</span>
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
                    :title="
                      item.status === 'critical' ? 'Nguy hiểm' : 'Cảnh báo'
                    "
                  ></span>
                </td>
              </tr>
              <tr v-if="lowStock.length === 0">
                <td colspan="4" class="text-center text-success">
                  <i
                    class="fa-solid fa-circle-check"
                    style="margin-right: 4px"
                  ></i>
                  Kho hàng ổn định
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
          <div v-if="topProducts.length === 0" class="empty-list">
            Chưa có dữ liệu
          </div>
        </div>
      </div>
    </div>

    <!-- ============ BOTTOM: Top Customers ============ -->
    <div class="content-grid one-column">
      <div class="data-card">
        <div class="card-header">
          <h3>Khách hàng thân thiết</h3>
          <a href="#" @click.prevent="$router.push('/customer-list')"
            >Xem tất cả</a
          >
        </div>
        <div class="customer-grid">
          <div
            v-for="(cust, idx) in topCustomers"
            :key="cust.id"
            class="customer-card"
          >
            <div class="avatar-circle">
              {{ getInitials(cust.name) }}
            </div>
            <div class="customer-info">
              <span class="customer-name">{{ cust.name }}</span>
              <span class="customer-orders"
                >{{ cust.totalOrders }} đơn hàng</span
              >
            </div>
            <div class="customer-spent">
              {{ formatCurrency(cust.totalSpent) }}
            </div>
          </div>
          <div v-if="topCustomers.length === 0" class="empty-list">
            Chưa có dữ liệu
          </div>
        </div>
      </div>
    </div>

    <!-- Auto-refresh indicator -->
    <div class="auto-refresh-bar" v-if="autoRefreshEnabled">
      <i class="fa-solid fa-rotate"></i>
      Tự động cập nhật mỗi 5 phút
      <button class="link-btn" @click="toggleAutoRefresh">Tắt</button>
    </div>
    <div class="auto-refresh-bar off" v-else>
      <i class="fa-solid fa-pause"></i>
      Tự động cập nhật đã tắt
      <button class="link-btn" @click="toggleAutoRefresh">Bật</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import dashboardService from "@/services/dashboardService";
import formatCurrency from "@/utils/formatCurrency";
import { useAuth } from "@/composables/useAuth";
import RevenueOrderChart from "@/components/dashboard/RevenueOrderChart.vue";
import SalesChannelChart from "@/components/dashboard/SalesChannelChart.vue";
import OrderStatusChart from "@/components/dashboard/OrderStatusChart.vue";

// ─── Auth ───
const { user } = useAuth();

// ─── State ───
const loading = ref(true);
const error = ref(null);
const lastUpdated = ref(null);

// Period filter
const preset = ref("month");
const dateFrom = ref("");
const dateTo = ref("");

// Auto-refresh
const autoRefreshEnabled = ref(true);
let autoRefreshTimer = null;
const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 phút

// Data
const stats = ref({});
const todayStats = ref({});
const recentOrders = ref([]);
const topProducts = ref([]);
const topCustomers = ref([]);
const lowStock = ref([]);
const revenueChartData = ref({});
const salesChannelData = ref([]);
const orderStatusData = ref([]);
const chartGroupBy = ref("day");

// ─── Computed ───
const todayFormatted = computed(() => {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});

const statCards = computed(() => [
  {
    key: "revenue",
    title: "Doanh thu",
    icon: "fa-solid fa-sack-dollar",
    iconClass: "revenue",
    formatted: formatCurrency(stats.value.revenue?.current),
    change: stats.value.revenue?.change,
  },
  {
    key: "orders",
    title: "Đơn hàng",
    icon: "fa-solid fa-file-invoice-dollar",
    iconClass: "orders",
    formatted: stats.value.orders?.current || 0,
    change: stats.value.orders?.change,
  },
  {
    key: "newCustomers",
    title: "Khách mới",
    icon: "fa-solid fa-user-plus",
    iconClass: "customers",
    formatted: stats.value.newCustomers?.current || 0,
    change: stats.value.newCustomers?.change,
  },
  {
    key: "avgOrderValue",
    title: "Giá trị đơn TB",
    icon: "fa-solid fa-chart-line",
    iconClass: "avg",
    formatted: formatCurrency(stats.value.avgOrderValue?.current),
    change: stats.value.avgOrderValue?.change,
  },
]);

// ─── Date Helpers ───
const formatDate = (d) => d.toISOString().split("T")[0];

const initDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  dateFrom.value = formatDate(firstDay);
  dateTo.value = formatDate(now);
};

const setPreset = (p) => {
  preset.value = p;
  const now = new Date();
  dateTo.value = formatDate(now);
  if (p === "7d") {
    dateFrom.value = formatDate(new Date(now - 7 * 24 * 60 * 60 * 1000));
  } else if (p === "30d") {
    dateFrom.value = formatDate(new Date(now - 30 * 24 * 60 * 60 * 1000));
  } else {
    dateFrom.value = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }
  fetchPeriodData();
};

const onDateChange = () => {
  preset.value = "";
  fetchPeriodData();
};

const getDateParams = () => ({ from: dateFrom.value, to: dateTo.value });

// ─── Fetch Methods ───
const fetchAllData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [
      overviewRes,
      statsRes,
      todayRes,
      topProdRes,
      topCustRes,
      lowStockRes,
      orderStatusRes,
    ] = await Promise.all([
      dashboardService.getOverview(),
      dashboardService.getStats(getDateParams()),
      dashboardService.getTodayStats(),
      dashboardService.getTopProducts({ ...getDateParams(), limit: 5 }),
      dashboardService.getTopCustomers({ ...getDateParams(), limit: 5 }),
      dashboardService.getLowStock({ limit: 5 }),
      dashboardService.getOrderStatus(getDateParams()),
    ]);

    if (overviewRes.data.success) {
      recentOrders.value = overviewRes.data.data.recentOrders || [];
    }
    if (statsRes.data.success) stats.value = statsRes.data.data;
    if (todayRes.data.success) todayStats.value = todayRes.data.data;
    if (topProdRes.data.success) topProducts.value = topProdRes.data.data;
    if (topCustRes.data.success) topCustomers.value = topCustRes.data.data;
    if (lowStockRes.data.success) lowStock.value = lowStockRes.data.data;
    if (orderStatusRes.data.success)
      orderStatusData.value = orderStatusRes.data.data;

    await fetchRevenueChart();
    await fetchSalesChannels();
    updateLastUpdated();
  } catch (err) {
    console.error("Error loading dashboard:", err);
    error.value = "Không thể tải dữ liệu dashboard. Vui lòng thử lại.";
  } finally {
    loading.value = false;
  }
};

// Fetch chỉ những phần phụ thuộc dateRange (không reload overview & today)
const fetchPeriodData = async () => {
  error.value = null;
  try {
    const [statsRes, topProdRes, topCustRes, orderStatusRes] =
      await Promise.all([
        dashboardService.getStats(getDateParams()),
        dashboardService.getTopProducts({ ...getDateParams(), limit: 5 }),
        dashboardService.getTopCustomers({ ...getDateParams(), limit: 5 }),
        dashboardService.getOrderStatus(getDateParams()),
      ]);

    if (statsRes.data.success) stats.value = statsRes.data.data;
    if (topProdRes.data.success) topProducts.value = topProdRes.data.data;
    if (topCustRes.data.success) topCustomers.value = topCustRes.data.data;
    if (orderStatusRes.data.success)
      orderStatusData.value = orderStatusRes.data.data;

    await fetchRevenueChart();
    await fetchSalesChannels();
    updateLastUpdated();
  } catch (err) {
    console.error("Error refreshing period data:", err);
    error.value = "Lỗi khi cập nhật dữ liệu theo kỳ.";
  }
};

const fetchRevenueChart = async () => {
  try {
    const res = await dashboardService.getRevenueChart({
      ...getDateParams(),
      groupBy: chartGroupBy.value,
    });
    if (res.data.success) revenueChartData.value = res.data.data;
  } catch (err) {
    console.error("Revenue chart error:", err);
  }
};

const fetchSalesChannels = async () => {
  try {
    const res = await dashboardService.getSalesChannels(getDateParams());
    if (res.data.success) salesChannelData.value = res.data.data;
  } catch (err) {
    console.error("Sales channel error:", err);
  }
};

// ─── Refresh ───
const handleRefresh = () => {
  fetchAllData();
};

const updateLastUpdated = () => {
  lastUpdated.value = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value;
  if (autoRefreshEnabled.value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
};

const startAutoRefresh = () => {
  stopAutoRefresh();
  autoRefreshTimer = setInterval(fetchAllData, AUTO_REFRESH_MS);
};

const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
};

// ─── Helpers ───
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

// ─── Lifecycle ───
onMounted(() => {
  initDates();
  fetchAllData();
  if (autoRefreshEnabled.value) startAutoRefresh();
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
/* ===== BASE ===== */
.dashboard-overview {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
  background: var(--app-bg, #f4f6fa);
  min-height: 100vh;
}

.dashboard-overview > * {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.dashboard-overview > *:nth-child(1) {
  animation-delay: 0ms;
}
.dashboard-overview > *:nth-child(2) {
  animation-delay: 40ms;
}
.dashboard-overview > *:nth-child(3) {
  animation-delay: 80ms;
}
.dashboard-overview > *:nth-child(4) {
  animation-delay: 120ms;
}
.dashboard-overview > *:nth-child(5) {
  animation-delay: 160ms;
}
.dashboard-overview > *:nth-child(6) {
  animation-delay: 200ms;
}
.dashboard-overview > *:nth-child(7) {
  animation-delay: 240ms;
}
.dashboard-overview > *:nth-child(8) {
  animation-delay: 280ms;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== WELCOME BANNER ===== */
.welcome-banner {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
  color: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
  position: relative;
  overflow: hidden;
}
.welcome-banner::before {
  content: "";
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
.welcome-text {
  flex: 1;
  z-index: 2;
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
  font-weight: 800;
  text-transform: uppercase;
}

.banner-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 2;
}
.btn-refresh {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.3);
}
.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.last-updated {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* ===== QUICK ACTIONS ===== */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 20px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
  transition: all 0.2s;
  flex-shrink: 0;
}
.action-btn:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12);
  transform: translateY(-2px);
}
.action-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.action-icon.pos {
  background: #dbeafe;
  color: #2563eb;
}
.action-icon.order {
  background: #d1fae5;
  color: #059669;
}
.action-icon.product {
  background: #fef3c7;
  color: #d97706;
}
.action-icon.inventory {
  background: #ede9fe;
  color: #7c3aed;
}
.action-icon.report {
  background: #fce7f3;
  color: #db2777;
}

/* ===== TODAY SECTION ===== */
.today-section {
  margin-bottom: 20px;
}
.section-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.today-date {
  font-weight: 400;
  color: #94a3b8;
  margin-left: 4px;
}
.today-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}
.today-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #e2e8f0;
  transition: all 0.25s;
}
.today-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}
.today-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.today-icon.revenue {
  background: #dcfce7;
  color: #16a34a;
}
.today-icon.orders {
  background: #dbeafe;
  color: #2563eb;
}
.today-icon.pending {
  background: #fef3c7;
  color: #d97706;
}
.today-icon.customers {
  background: #ede9fe;
  color: #7c3aed;
}
.today-info {
  display: flex;
  flex-direction: column;
}
.today-label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}
.today-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

/* ===== FILTER BAR ===== */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.date-picker-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.date-picker-group label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}
.date-picker-group input[type="date"] {
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #334155;
  outline: none;
  transition: border-color 0.2s;
}
.date-picker-group input[type="date"]:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}
.preset-btns {
  display: flex;
  gap: 4px;
}
.preset-btns button {
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 0.8rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 500;
}
.preset-btns button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
.preset-btns button.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

/* ===== ERROR BANNER ===== */
.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: #991b1b;
  font-size: 0.9rem;
}
.error-banner i {
  font-size: 1.2rem;
  color: #ef4444;
}
.error-banner span {
  flex: 1;
}
.error-banner button {
  padding: 6px 16px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
}
.error-banner button:hover {
  background: #dc2626;
}

/* ===== STATS GRID ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
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
.text-danger {
  color: #ef4444;
}
.text-success {
  color: #16a34a;
}
.text-center {
  text-align: center;
}

/* ===== CHARTS ===== */
.charts-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
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
.chart-body.compact {
  min-height: 300px;
  padding: 8px;
}

/* ===== CONTENT GRID ===== */
.content-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}
.two-columns {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}
.one-column {
  grid-template-columns: 1fr;
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
  font-size: 1rem;
  color: #37474f;
  font-weight: 600;
}
.card-header a {
  font-size: 0.85rem;
  color: #2196f3;
  text-decoration: none;
  font-weight: 500;
}
.card-header a:hover {
  text-decoration: underline;
}
.card-header select {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #cfd8dc;
  color: #546e7a;
  font-size: 0.9rem;
  outline: none;
}

/* ===== TABLE ===== */
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
  display: inline-block;
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

/* Low Stock */
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

/* ===== LIST GROUP ===== */
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
  width: 28px;
  height: 28px;
  background: #eceff1;
  color: #546e7a;
  border-radius: 50%;
  text-align: center;
  line-height: 28px;
  font-size: 0.85rem;
  font-weight: bold;
  margin-right: 14px;
  flex-shrink: 0;
}
.list-item:nth-child(1) .rank {
  background: #fef3c7;
  color: #d97706;
}
.list-item:nth-child(2) .rank {
  background: #e2e8f0;
  color: #64748b;
}
.list-item:nth-child(3) .rank {
  background: #fed7aa;
  color: #ea580c;
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
.empty-list {
  padding: 32px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* ===== CUSTOMER GRID ===== */
.customer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0;
}
.customer-card {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}
.customer-card:hover {
  background: #f8fafc;
}
.avatar-circle {
  width: 40px;
  height: 40px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 14px;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.customer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.customer-name {
  font-weight: 600;
  color: #1e293b;
}
.customer-orders {
  font-size: 0.85rem;
  color: #94a3b8;
}
.customer-spent {
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}

/* ===== AUTO-REFRESH BAR ===== */
.auto-refresh-bar {
  text-align: center;
  padding: 10px;
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.auto-refresh-bar.off {
  color: #cbd5e1;
}
.link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.8rem;
  text-decoration: underline;
  padding: 0;
}

/* ===== SKELETON LOADING ===== */
.skeleton-card {
  display: flex;
  align-items: center;
  gap: 14px;
}
.skeleton-circle {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  flex-shrink: 0;
}
.skeleton-circle.big {
  width: 50px;
  height: 50px;
  border-radius: 12px;
}
.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skeleton-lines.flex1 {
  flex: 1;
}
.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skeleton-line.short {
  width: 60px;
}
.skeleton-line.medium {
  width: 100px;
}
.skeleton-line.long {
  width: 140px;
}
.skeleton-table {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.skeleton-row {
  display: flex;
  gap: 16px;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .charts-row {
    flex-direction: column;
  }
  .main-chart,
  .side-chart {
    min-height: 300px;
    width: 100%;
  }
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .filter-right {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .dashboard-overview {
    padding: 16px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .two-columns {
    grid-template-columns: 1fr;
  }
  .today-grid {
    grid-template-columns: 1fr 1fr;
  }
  .welcome-banner {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  .welcome-banner img {
    margin-right: 0;
    margin-bottom: 12px;
  }
  .banner-actions {
    flex-direction: row;
    margin-top: 12px;
  }
  .quick-actions {
    gap: 8px;
  }
  .action-btn {
    padding: 10px 14px;
    font-size: 0.8rem;
  }
  .preset-btns {
    flex-wrap: wrap;
  }
  .customer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
