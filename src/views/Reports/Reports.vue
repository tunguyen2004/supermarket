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
        :icons="datePickerIcons"
      />
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="color: #3b82f6; background: #eff6ff">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-title">Tổng doanh thu</div>
          <div class="stat-value">156.820.000đ</div>
          <div class="stat-trend increase">+12.5% so với kỳ trước</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #16a34a; background: #f0fdf4">
          <el-icon><Tickets /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-title">Tổng đơn hàng</div>
          <div class="stat-value">1.240</div>
          <div class="stat-trend increase">+8.2% so với kỳ trước</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #f97316; background: #fff7ed">
          <el-icon><ShoppingCartFull /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-title">Giá trị trung bình đơn</div>
          <div class="stat-value">126.467đ</div>
          <div class="stat-trend increase">+4.1% so với kỳ trước</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #8b5cf6; background: #f5f3ff">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-title">Khách hàng mới</div>
          <div class="stat-value">82</div>
          <div class="stat-trend decrease">-5.5% so với kỳ trước</div>
        </div>
      </div>
    </div>

    <div class="content-card">
      <h2 class="card-section-title">Biểu đồ doanh thu</h2>
      <div style="height: 250px;">
        <revenue-line-chart />
      </div>
    </div>

    <div class="details-grid">
      <div class="content-card">
        <h2 class="card-section-title">Top 5 sản phẩm bán chạy</h2>
        <div style="height: 300px;">
          <top-products-chart />
        </div>
      </div>
      <div class="content-card">
        <h2 class="card-section-title">Phân loại theo kênh bán hàng</h2>
        <div style="height: 300px;">
          <sales-channel-chart />
        </div>
      </div>
    </div>

    <div class="details-grid">
      <div class="content-card">
        <h2 class="card-section-title">Khách hàng chi tiêu nhiều nhất</h2>
        <el-table :data="topCustomers" :show-header="false" style="width: 100%">
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
        <el-table
          :data="lowStockProducts"
          :show-header="false"
          style="width: 100%"
        >
          <el-table-column>
            <template #default="scope">
              <div class="customer-info">
                <el-image
                  class="low-stock-image"
                  :src="scope.row.imageUrl"
                  fit="cover"
                />
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="right">
            <template #default="scope">
              <el-tag type="danger">Còn lại {{ scope.row.stock }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
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
} from "@element-plus/icons-vue";

// Responsive State
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// Data
const dateRange = ref("");
const datePickerIcons = {
  prefix: Calendar,
  prev: ArrowLeft,
  dPrev: DArrowLeft,
  next: ArrowRight,
  dNext: DArrowRight,
};

const topCustomers = ref([
  {
    name: "Nguyễn Thị Bình",
    totalSpent: 8250000,
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    name: "Đỗ Ngọc Giang",
    totalSpent: 5400000,
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026706d",
  },
  { name: "Trần Văn An", totalSpent: 15600000, avatarUrl: "" },
]);

const lowStockProducts = ref([
  {
    name: "Mì Hảo Hảo",
    stock: 15,
    imageUrl: "https://i.imgur.com/GCRzZ3c.png",
  },
  {
    name: "Trứng gà 10 quả",
    stock: 0,
    imageUrl: "https://i.imgur.com/7g2jBGY.png",
  },
  {
    name: "Bột ngọt Ajinomoto",
    stock: 8,
    imageUrl: "https://i.imgur.com/8mB3H6f.png",
  },
]);

const formatCurrency = (value) => value.toLocaleString("vi-VN") + "đ";
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
