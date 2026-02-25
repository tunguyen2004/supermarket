<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Danh sách báo cáo</h1>
      <el-button type="primary" :icon="Plus" @click="addReport">
        Tạo báo cáo mới
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo tên hoặc loại báo cáo..."
          clearable
          :prefix-icon="Search"
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
        <el-select
          v-if="!isMobile"
          v-model="reportTypeFilter"
          placeholder="Lọc theo loại"
          clearable
          @change="onSearch"
        >
          <el-option label="Doanh thu" value="Doanh thu"></el-option>
          <el-option label="Đơn hàng" value="Đơn hàng"></el-option>
        </el-select>
      </div>

      <!-- Loading -->
      <div v-if="loading" style="padding: 40px; text-align: center">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        <span style="margin-left: 8px; color: #6b7280">Đang tải...</span>
      </div>

      <!-- Desktop table -->
      <el-table v-else-if="!isMobile" :data="pagedReports" style="width: 100%">
        <el-table-column label="Tên báo cáo" min-width="300">
          <template #default="scope">
            <div class="report-info">
              <div class="report-icon">
                <el-icon>
                  <DataAnalysis v-if="scope.row.type === 'Doanh thu'" />
                  <Tickets v-else />
                </el-icon>
              </div>
              <div>
                <div>{{ scope.row.name }}</div>
                <div style="font-size: 12px; color: #6b7280">
                  {{ scope.row.period }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="Loại" width="120" />
        <el-table-column label="Doanh thu" width="160" align="right">
          <template #default="scope">
            <span class="top-spent-value">{{
              formatCurrency(scope.row.revenue)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Đơn hàng" width="100" align="center">
          <template #default="scope">
            {{ scope.row.orders.toLocaleString("vi-VN") }}
          </template>
        </el-table-column>
        <el-table-column prop="date" label="Ngày tạo" width="140" />
        <el-table-column label="Thao tác" width="180" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="View"
                text
                bg
                @click="viewReport(row)"
                >Xem</el-button
              >
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                text
                bg
                @click="deleteReport(row)"
                >Xóa</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Mobile cards -->
      <div v-else class="mobile-card-list">
        <div v-for="item in pagedReports" :key="item.id" class="mobile-card">
          <div class="card-header report-info">
            <div class="report-icon">
              <el-icon>
                <DataAnalysis v-if="item.type === 'Doanh thu'" />
                <Tickets v-else />
              </el-icon>
            </div>
            <span class="card-title">{{ item.name }}</span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Loại</span>
              <span class="card-value">{{ item.type }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Doanh thu</span>
              <span class="card-value">{{ formatCurrency(item.revenue) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Đơn hàng</span>
              <span class="card-value">{{ item.orders }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Kỳ</span>
              <span class="card-value">{{ item.period }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="View"
              text
              bg
              @click="viewReport(item)"
              >Xem</el-button
            >
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              text
              bg
              @click="deleteReport(item)"
              >Xóa</el-button
            >
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredReports.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- Create Report Dialog -->
    <el-dialog
      v-model="isCreateModalVisible"
      title="Tạo báo cáo mới"
      width="500px"
    >
      <el-form :model="newReportForm" label-position="top">
        <el-form-item label="Tên báo cáo">
          <el-input
            v-model="newReportForm.name"
            placeholder="VD: Báo cáo doanh thu tháng 1"
          ></el-input>
        </el-form-item>
        <el-form-item label="Loại báo cáo">
          <el-select
            v-model="newReportForm.type"
            placeholder="Chọn loại báo cáo"
            style="width: 100%"
          >
            <el-option label="Doanh thu" value="Doanh thu"></el-option>
            <el-option label="Đơn hàng" value="Đơn hàng"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Khoảng thời gian">
          <el-date-picker
            v-model="newReportForm.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isCreateModalVisible = false">Hủy</el-button>
        <el-button
          type="primary"
          :loading="creating"
          @click="handleCreateReport"
          >Tạo</el-button
        >
      </template>
    </el-dialog>

    <!-- View Report Dialog -->
    <el-dialog
      v-model="isViewModalVisible"
      :title="viewingReport?.name || 'Chi tiết báo cáo'"
      width="700px"
    >
      <div v-if="viewingReport" class="report-detail">
        <div class="report-detail-grid">
          <div class="detail-card blue">
            <div class="detail-label">Tổng doanh thu</div>
            <div class="detail-value">
              {{ formatCurrency(viewingReport.revenue) }}
            </div>
          </div>
          <div class="detail-card green">
            <div class="detail-label">Tổng đơn hàng</div>
            <div class="detail-value">
              {{ viewingReport.orders.toLocaleString("vi-VN") }}
            </div>
          </div>
          <div class="detail-card orange">
            <div class="detail-label">Giảm giá</div>
            <div class="detail-value">
              {{ formatCurrency(viewingReport.discount) }}
            </div>
          </div>
          <div class="detail-card purple">
            <div class="detail-label">Khách hàng</div>
            <div class="detail-value">{{ viewingReport.customers }}</div>
          </div>
        </div>
        <div style="margin-top: 16px; color: #6b7280; font-size: 0.85rem">
          Kỳ báo cáo: {{ viewingReport.period }}
        </div>

        <!-- Payment method breakdown if available -->
        <div
          v-if="viewingReport.byPayment && viewingReport.byPayment.length > 0"
          style="margin-top: 20px"
        >
          <h4 style="margin-bottom: 10px; font-weight: 600">
            Theo phương thức thanh toán
          </h4>
          <el-table
            :data="viewingReport.byPayment"
            size="small"
            style="width: 100%"
          >
            <el-table-column prop="method" label="Phương thức">
              <template #default="{ row }">{{
                paymentMethodLabel(row.method)
              }}</template>
            </el-table-column>
            <el-table-column
              label="Số đơn"
              prop="order_count"
              align="center"
              width="100"
            />
            <el-table-column label="Tổng tiền" align="right" width="160">
              <template #default="{ row }">{{
                formatCurrency(row.total_amount)
              }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="isViewModalVisible = false">Đóng</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import {
  Search,
  Plus,
  Delete,
  View,
  DataAnalysis,
  Tickets,
  Loading,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import apiClient from "@/services/apiClient";

const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  loadSavedReports();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

const search = ref("");
const reportTypeFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;
const loading = ref(false);
const creating = ref(false);

// Reports are stored in localStorage
const STORAGE_KEY = "minimart_reports";
const reports = ref([]);

function loadSavedReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      reports.value = JSON.parse(saved);
    }
  } catch (e) {
    reports.value = [];
  }
}

function saveReports() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.value));
}

const isCreateModalVisible = ref(false);
const newReportForm = reactive({
  name: "",
  type: "",
  dateRange: null,
});

const isViewModalVisible = ref(false);
const viewingReport = ref(null);

const filteredReports = computed(() => {
  return reports.value.filter((item) => {
    const searchMatch = search.value
      ? item.name.toLowerCase().includes(search.value.toLowerCase()) ||
        item.type.toLowerCase().includes(search.value.toLowerCase())
      : true;
    const typeMatch = reportTypeFilter.value
      ? item.type === reportTypeFilter.value
      : true;
    return searchMatch && typeMatch;
  });
});

const pagedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredReports.value.slice(start, start + pageSize);
});

const onSearch = () => {
  currentPage.value = 1;
};

const addReport = () => {
  Object.assign(newReportForm, { name: "", type: "", dateRange: null });
  isCreateModalVisible.value = true;
};

const handleCreateReport = async () => {
  if (!newReportForm.name || !newReportForm.type) {
    ElMessage.error("Vui lòng nhập tên và chọn loại báo cáo.");
    return;
  }
  if (!newReportForm.dateRange || newReportForm.dateRange.length !== 2) {
    ElMessage.error("Vui lòng chọn khoảng thời gian.");
    return;
  }

  creating.value = true;
  try {
    const [from, to] = newReportForm.dateRange;

    // Fetch real data from API
    const res = await apiClient.get("/api/reports/daily", {
      params: { from, to },
    });

    const data = res.data?.data;
    const summary = data?.summary || {};

    const newReport = {
      id: Date.now(),
      name: newReportForm.name,
      type: newReportForm.type,
      date: new Date().toISOString().slice(0, 10),
      from,
      to,
      period: `${formatDateVN(from)} - ${formatDateVN(to)}`,
      revenue: summary.net_revenue || 0,
      orders: summary.total_orders || 0,
      discount: summary.total_discount || 0,
      customers: summary.unique_customers || 0,
      avgOrderValue: summary.avg_order_value || 0,
      byPayment: data?.by_payment_method || [],
      byStaff: data?.by_staff || [],
    };

    reports.value.unshift(newReport);
    saveReports();
    isCreateModalVisible.value = false;
    ElMessage.success("Đã tạo báo cáo thành công!");
  } catch (err) {
    console.error("Create report error:", err);
    ElMessage.error("Không thể tạo báo cáo. Vui lòng thử lại.");
  } finally {
    creating.value = false;
  }
};

const viewReport = (report) => {
  viewingReport.value = report;
  isViewModalVisible.value = true;
};

const deleteReport = (reportToDelete) => {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa báo cáo "${reportToDelete.name}"?`,
    "Xác nhận xóa",
    {
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      type: "warning",
    },
  )
    .then(() => {
      reports.value = reports.value.filter((r) => r.id !== reportToDelete.id);
      saveReports();
      ElMessage.success("Đã xóa báo cáo thành công.");
    })
    .catch(() => {});
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return "0đ";
  return Math.round(value).toLocaleString("vi-VN") + "đ";
};

function formatDateVN(d) {
  if (!d) return "";
  const parts = d.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function paymentMethodLabel(m) {
  const map = {
    cash: "Tiền mặt",
    card: "Thẻ",
    transfer: "Chuyển khoản",
    "bank transfer": "Chuyển khoản",
    bank_transfer: "Chuyển khoản",
    qr: "QR Code",
  };
  return map[m] || m || "Khác";
}
</script>

<style scoped>
.report-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.report-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #eff6ff;
  color: #2563eb;
  font-size: 18px;
  flex-shrink: 0;
}
.filters-bar {
  justify-content: space-between;
}
/* ----- GLOBAL LAYOUT & TYPOGRAPHY ----- */
.page-container {
  padding: 16px;
  background-color: #f9fafb;
  font-family: "Inter", sans-serif;
  min-height: 100vh;
}
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

/* ----- CONTAINERS & BARS ----- */
.table-container {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* ----- MOBILE CARD STYLES ----- */
.mobile-card-list {
  padding: 16px;
}
.mobile-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
}
.card-title {
  color: #111827;
}
.card-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}
.card-label {
  color: #6b7280;
}
.card-value {
  color: #111827;
  font-weight: 500;
  text-align: right;
}
.card-footer {
  padding: 8px 16px;
  background-color: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ----- REPORT DETAIL ----- */
.top-spent-value {
  font-weight: 600;
  color: #059669;
}
.report-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.detail-card {
  padding: 16px;
  border-radius: 10px;
  text-align: center;
}
.detail-card.blue {
  background: #eff6ff;
}
.detail-card.green {
  background: #ecfdf5;
}
.detail-card.orange {
  background: #fff7ed;
}
.detail-card.purple {
  background: #f5f3ff;
}
.detail-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 4px;
}
.detail-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

/* ----- ELEMENT PLUS CUSTOMIZATION ----- */
.page-container :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}
.page-container :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}

:deep(.el-form-item__content) {
  width: 100%;
}

/* ----- DESKTOP OVERRIDES ----- */
@media (min-width: 768px) {
  .page-container {
    padding: 24px 32px;
  }
  .page-title {
    font-size: 1.75rem;
  }
  .filters-bar {
    padding: 16px 20px;
  }
  .pagination-container {
    justify-content: flex-end;
  }
  .page-container :deep(.el-button--primary) {
    background-color: #2563eb;
    border-color: #2563eb;
  }
  .page-container :deep(.el-input) {
    /* max-width: 400px; */
  }
  .page-container :deep(.el-table th) {
    background-color: #f9fafb !important;
    color: #6b7280;
    font-weight: 600;
  }
  .page-container :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid #f3f4f6;
    padding: 14px 0;
  }
  .page-container :deep(.el-table .el-table__row:hover > td) {
    background-color: #f9fafb !important;
  }
  .page-container
    :deep(
      .el-pagination.is-background .el-pager li:not(.is-disabled).is-active
    ) {
    background-color: #2563eb;
  }
}
</style>
