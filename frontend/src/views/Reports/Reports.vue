<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Tổng quan</h1>
        <p class="page-subtitle">
          Dữ liệu được cập nhật đến
          {{ new Date().toLocaleTimeString("vi-VN") }}, hôm nay là
          {{
            new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          }}.
        </p>
      </div>
      <el-date-picker
        v-if="!isMobile"
        v-model="dateRange"
        type="daterange"
        range-separator="-"
        start-placeholder="Ngày bắt đầu"
        end-placeholder="Ngày kết thúc"
        format="DD/MM/YYYY"
        value-format="YYYY-MM-DD"
        :icons="datePickerIcons"
        @change="onDateChange"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrapper">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <span style="margin-left: 8px; color: #6b7280">Đang tải dữ liệu...</span>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="color: #3b82f6; background: #eff6ff">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">Tổng doanh thu</div>
            <div class="stat-value">
              {{ formatCurrency(stats.totalRevenue) }}
            </div>
            <div
              class="stat-trend"
              :class="stats.revenueChange >= 0 ? 'increase' : 'decrease'"
            >
              {{ stats.revenueChange >= 0 ? "+" : ""
              }}{{ stats.revenueChange }}% so với kỳ trước
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: #16a34a; background: #f0fdf4">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">Tổng đơn hàng</div>
            <div class="stat-value">
              {{ stats.totalOrders.toLocaleString("vi-VN") }}
            </div>
            <div
              class="stat-trend"
              :class="stats.ordersChange >= 0 ? 'increase' : 'decrease'"
            >
              {{ stats.ordersChange >= 0 ? "+" : "" }}{{ stats.ordersChange }}%
              so với kỳ trước
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: #f97316; background: #fff7ed">
            <el-icon><ShoppingCartFull /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">Giá trị trung bình đơn</div>
            <div class="stat-value">
              {{ formatCurrency(stats.avgOrderValue) }}
            </div>
            <div
              class="stat-trend"
              :class="stats.avgOrderChange >= 0 ? 'increase' : 'decrease'"
            >
              {{ stats.avgOrderChange >= 0 ? "+" : ""
              }}{{ stats.avgOrderChange }}% so với kỳ trước
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: #8b5cf6; background: #f5f3ff">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">Khách hàng mới</div>
            <div class="stat-value">
              {{ stats.newCustomers.toLocaleString("vi-VN") }}
            </div>
            <div
              class="stat-trend"
              :class="stats.customersChange >= 0 ? 'increase' : 'decrease'"
            >
              {{ stats.customersChange >= 0 ? "+" : ""
              }}{{ stats.customersChange }}% so với kỳ trước
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header-row">
          <h2 class="card-section-title" style="margin-bottom: 0">
            Biểu đồ doanh thu
          </h2>
          <el-radio-group
            v-model="chartGroupBy"
            size="small"
            @change="fetchRevenueChart"
          >
            <el-radio-button value="day">Ngày</el-radio-button>
            <el-radio-button value="week">Tuần</el-radio-button>
            <el-radio-button value="month">Tháng</el-radio-button>
          </el-radio-group>
        </div>
        <div style="height: 250px">
          <revenue-line-chart :chart-data="revenueChartData" />
        </div>
      </div>

      <div class="details-grid">
        <div class="content-card">
          <h2 class="card-section-title">Top 5 sản phẩm bán chạy</h2>
          <div style="height: 300px">
            <top-products-chart :chart-data="topProductsData" />
          </div>
        </div>
        <div class="content-card">
          <h2 class="card-section-title">Phân loại theo kênh bán hàng</h2>
          <div style="height: 300px">
            <sales-channel-chart :chart-data="salesChannelsData" />
          </div>
        </div>
      </div>

      <div class="details-grid">
        <div class="content-card">
          <h2 class="card-section-title">Khách hàng chi tiêu nhiều nhất</h2>
          <div v-if="topCustomers.length === 0" class="empty-hint">
            Không có dữ liệu
          </div>
          <el-table
            v-else
            :data="topCustomers"
            :show-header="false"
            style="width: 100%"
          >
            <el-table-column>
              <template #default="scope">
                <div class="customer-info">
                  <el-avatar :size="32" :src="scope.row.avatarUrl">{{
                    scope.row.name.charAt(0)
                  }}</el-avatar>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="right">
              <template #default="scope">
                <span class="top-spent-value">{{
                  formatCurrency(scope.row.totalSpent)
                }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="content-card">
          <h2 class="card-section-title">Sản phẩm sắp hết hàng</h2>
          <div v-if="lowStockProducts.length === 0" class="empty-hint">
            Tất cả sản phẩm đều đủ hàng
          </div>
          <el-table
            v-else
            :data="lowStockProducts"
            :show-header="false"
            style="width: 100%"
          >
            <el-table-column>
              <template #default="scope">
                <div class="customer-info">
                  <el-avatar :size="32" shape="square">
                    <el-icon><Box /></el-icon>
                  </el-avatar>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="right">
              <template #default="scope">
                <el-tag :type="scope.row.stock === 0 ? 'danger' : 'warning'">
                  Còn lại {{ scope.row.stock }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import apiClient from "@/services/apiClient";
import RevenueLineChart from "./RevenueLineChart.vue";
import TopProductsChart from "../../components/TopProductsChart.vue";
import SalesChannelChart from "../../components/SalesChannelChart.vue";
import {
  Money,
  Tickets,
  User,
  ShoppingCartFull,
  Calendar,
  ArrowLeft,
  ArrowRight,
  DArrowLeft,
  DArrowRight,
  Loading,
  Box,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// Responsive State
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchAll();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// Date range — default last 30 days
const now = new Date();
const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
const fmt = (d) => d.toISOString().split("T")[0];
const dateRange = ref([fmt(thirtyDaysAgo), fmt(now)]);
const datePickerIcons = {
  prefix: Calendar,
  prev: ArrowLeft,
  dPrev: DArrowLeft,
  next: ArrowRight,
  dNext: DArrowRight,
};

// State
const loading = ref(true);
const chartGroupBy = ref("day");

const stats = ref({
  totalRevenue: 0,
  revenueChange: 0,
  totalOrders: 0,
  ordersChange: 0,
  avgOrderValue: 0,
  avgOrderChange: 0,
  newCustomers: 0,
  customersChange: 0,
});

const revenueChartData = ref({ labels: [], datasets: [] });
const topProductsData = ref([]);
const salesChannelsData = ref([]);
const topCustomers = ref([]);
const lowStockProducts = ref([]);

// Helpers
const formatCurrency = (value) => {
  if (!value && value !== 0) return "0đ";
  return Math.round(value).toLocaleString("vi-VN") + "đ";
};

function getDateParams() {
  if (dateRange.value && dateRange.value.length === 2) {
    return { from: dateRange.value[0], to: dateRange.value[1] };
  }
  return { from: fmt(thirtyDaysAgo), to: fmt(now) };
}

function onDateChange() {
  fetchAll();
}

// Fetch all data
async function fetchAll() {
  loading.value = true;
  try {
    const params = getDateParams();
    await Promise.all([
      fetchStats(params),
      fetchRevenueChart(null, params),
      fetchTopProducts(params),
      fetchSalesChannels(params),
      fetchTopCustomers(params),
      fetchLowStock(),
    ]);
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  } finally {
    loading.value = false;
  }
}

async function fetchStats(params) {
  try {
    const p = params || getDateParams();
    const res = await apiClient.get("/api/dashboard/stats", { params: p });
    if (res.data?.success) {
      stats.value = res.data.data;
    }
  } catch (err) {
    console.error("Stats error:", err);
  }
}

async function fetchRevenueChart(groupBy, params) {
  try {
    const p = params || getDateParams();
    const res = await apiClient.get("/api/dashboard/revenue-chart", {
      params: { ...p, groupBy: groupBy || chartGroupBy.value },
    });
    if (res.data?.success) {
      revenueChartData.value = res.data.data;
    }
  } catch (err) {
    console.error("Revenue chart error:", err);
  }
}

async function fetchTopProducts(params) {
  try {
    const p = params || getDateParams();
    const res = await apiClient.get("/api/dashboard/top-products", {
      params: { ...p, limit: 5 },
    });
    if (res.data?.success) {
      topProductsData.value = res.data.data;
    }
  } catch (err) {
    console.error("Top products error:", err);
  }
}

async function fetchSalesChannels(params) {
  try {
    const p = params || getDateParams();
    const res = await apiClient.get("/api/dashboard/sales-channels", {
      params: p,
    });
    if (res.data?.success) {
      salesChannelsData.value = res.data.data;
    }
  } catch (err) {
    console.error("Sales channels error:", err);
  }
}

async function fetchTopCustomers(params) {
  try {
    const p = params || getDateParams();
    const res = await apiClient.get("/api/dashboard/top-customers", {
      params: { ...p, limit: 5 },
    });
    if (res.data?.success) {
      topCustomers.value = res.data.data;
    }
  } catch (err) {
    console.error("Top customers error:", err);
  }
}

async function fetchLowStock() {
  try {
    const res = await apiClient.get("/api/dashboard/low-stock", {
      params: { threshold: 20, limit: 10 },
    });
    if (res.data?.success) {
      lowStockProducts.value = res.data.data;
    }
  } catch (err) {
    console.error("Low stock error:", err);
  }
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background-color: #f8fafc;
  font-family: "Inter", sans-serif;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.page-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 4px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-title {
  color: #4b5563;
  font-size: 0.9rem;
  margin-bottom: 2px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}
.stat-trend {
  font-size: 0.8rem;
  margin-top: 4px;
}
.stat-trend.increase {
  color: #16a34a;
}
.stat-trend.decrease {
  color: #dc2626;
}

/* Content Cards */
.content-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}
.card-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
.empty-hint {
  text-align: center;
  color: #9ca3af;
  padding: 24px 0;
  font-size: 0.9rem;
}
.chart-placeholder {
  width: 100%;
  height: auto;
  border-radius: 8px;
  background-color: #f3f4f6;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.top-spent-value {
  font-weight: 500;
}
.low-stock-image {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .details-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 767px) {
  .dashboard-page {
    padding: 16px;
  }
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
