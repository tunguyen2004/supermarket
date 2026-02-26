<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Danh sách báo cáo</h1>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo mã hoặc tiêu đề..."
          clearable
          :prefix-icon="Search"
          @keyup.enter="loadReports"
          @clear="loadReports"
        />
        <el-select
          v-if="!isMobile"
          v-model="statusFilter"
          placeholder="Trạng thái"
          clearable
          @change="loadReports"
        >
          <el-option label="Đã nộp" value="submitted" />
          <el-option label="Đã duyệt" value="approved" />
          <el-option label="Từ chối" value="rejected" />
        </el-select>
      </div>

      <!-- Loading -->
      <div v-if="loading" style="padding: 40px; text-align: center">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        <span style="margin-left: 8px; color: #6b7280">Đang tải...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="reports.length === 0" class="empty-state">
        <i class="fa-solid fa-file-circle-xmark text-4xl text-slate-300"></i>
        <p class="text-slate-500 mt-3">Chưa có báo cáo nào được nộp</p>
      </div>

      <!-- Desktop table -->
      <el-table v-else-if="!isMobile" :data="reports" style="width: 100%">
        <el-table-column label="Mã báo cáo" width="200">
          <template #default="{ row }">
            <span class="report-code">{{ row.report_code }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Tiêu đề" min-width="280">
          <template #default="{ row }">
            <div class="report-info">
              <div class="report-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div>
                <div class="font-medium">{{ row.title }}</div>
                <div style="font-size: 12px; color: #6b7280">
                  {{ formatDateVN(row.period_from) }} → {{ formatDateVN(row.period_to) }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Doanh thu" width="160" align="right">
          <template #default="{ row }">
            <span class="top-spent-value">{{ formatCurrency(row.net_revenue) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Đơn hàng" width="100" align="center">
          <template #default="{ row }">
            {{ (row.total_orders || 0).toLocaleString("vi-VN") }}
          </template>
        </el-table-column>
        <el-table-column label="Người nộp" width="150">
          <template #default="{ row }">
            <span class="text-sm">{{ row.submitted_by_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ngày nộp" width="160">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ formatDateTime(row.submitted_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" round>
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="220" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" :icon="View" text bg @click="viewReport(row)">Xem</el-button>
              <el-button
                v-if="row.status === 'submitted'"
                size="small"
                type="success"
                :icon="Check"
                text bg
                @click="handleStatusChange(row, 'approved')"
              >Duyệt</el-button>
              <el-button
                v-if="row.status === 'submitted'"
                size="small"
                type="danger"
                :icon="Close"
                text bg
                @click="handleStatusChange(row, 'rejected')"
              >Từ chối</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Mobile cards -->
      <div v-else class="mobile-card-list">
        <div v-for="item in reports" :key="item.id" class="mobile-card">
          <div class="card-header">
            <div class="report-info">
              <div class="report-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div>
                <span class="report-code" style="font-size: 13px">{{ item.report_code }}</span>
                <div class="card-title" style="margin-top: 2px">{{ item.title }}</div>
              </div>
            </div>
            <el-tag :type="statusType(item.status)" size="small" round>
              {{ statusLabel(item.status) }}
            </el-tag>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Kỳ</span>
              <span class="card-value">{{ formatDateVN(item.period_from) }} → {{ formatDateVN(item.period_to) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Doanh thu</span>
              <span class="card-value top-spent-value">{{ formatCurrency(item.net_revenue) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Đơn hàng</span>
              <span class="card-value">{{ item.total_orders }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Người nộp</span>
              <span class="card-value">{{ item.submitted_by_name }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Ngày nộp</span>
              <span class="card-value">{{ formatDateTime(item.submitted_at) }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button size="small" :icon="View" text bg @click="viewReport(item)">Xem</el-button>
            <el-button v-if="item.status === 'submitted'" size="small" type="success" :icon="Check" text bg @click="handleStatusChange(item, 'approved')">Duyệt</el-button>
            <el-button v-if="item.status === 'submitted'" size="small" type="danger" :icon="Close" text bg @click="handleStatusChange(item, 'rejected')">Từ chối</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="totalReports"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="loadReports"
      />
    </div>

    <!-- View Report Dialog -->
    <el-dialog
      v-model="isViewModalVisible"
      :title="viewingReport?.title || 'Chi tiết báo cáo'"
      width="750px"
      :close-on-click-modal="true"
    >
      <div v-if="viewingReport" class="report-detail">
        <!-- Report code badge -->
        <div class="report-code-header">
          <div class="code-badge">
            <i class="fa-solid fa-hashtag"></i>
            {{ viewingReport.report_code }}
          </div>
          <el-tag :type="statusType(viewingReport.status)" round>
            {{ statusLabel(viewingReport.status) }}
          </el-tag>
        </div>

        <!-- Meta info -->
        <div class="meta-row">
          <span><i class="fa-solid fa-user"></i> Người nộp: <b>{{ viewingReport.submitted_by_name }}</b></span>
          <span><i class="fa-solid fa-calendar"></i> {{ formatDateTime(viewingReport.submitted_at) }}</span>
        </div>
        <div v-if="viewingReport.notes" class="notes-box">
          <i class="fa-solid fa-sticky-note"></i> {{ viewingReport.notes }}
        </div>

        <!-- KPI cards -->
        <div class="report-detail-grid">
          <div class="detail-card blue">
            <div class="detail-label">Doanh thu thuần</div>
            <div class="detail-value">{{ formatCurrency(getRevSummary.net_revenue) }}</div>
          </div>
          <div class="detail-card green">
            <div class="detail-label">Tổng đơn hàng</div>
            <div class="detail-value">{{ (getRevSummary.total_orders || 0).toLocaleString("vi-VN") }}</div>
          </div>
          <div class="detail-card orange">
            <div class="detail-label">Giảm giá</div>
            <div class="detail-value">{{ formatCurrency(getRevSummary.total_discount) }}</div>
          </div>
          <div class="detail-card purple">
            <div class="detail-label">Khách hàng</div>
            <div class="detail-value">{{ getRevSummary.unique_customers || 0 }}</div>
          </div>
        </div>

        <!-- Revenue detail -->
        <div class="detail-section">
          <h4>Tổng quan doanh thu</h4>
          <div class="detail-rows">
            <div class="detail-row">
              <span>Doanh thu gộp</span>
              <span class="font-semibold">{{ formatCurrency(getRevSummary.gross_revenue) }}</span>
            </div>
            <div class="detail-row">
              <span>Giảm giá</span>
              <span class="text-red-500">-{{ formatCurrency(getRevSummary.total_discount) }}</span>
            </div>
            <div class="detail-row">
              <span>Thuế</span>
              <span>{{ formatCurrency(getRevSummary.total_tax) }}</span>
            </div>
            <div class="detail-row">
              <span>Phí vận chuyển</span>
              <span>{{ formatCurrency(getRevSummary.total_shipping) }}</span>
            </div>
            <div class="detail-row border-t pt-2">
              <span class="font-semibold">Doanh thu thuần</span>
              <span class="font-bold text-blue-600">{{ formatCurrency(getRevSummary.net_revenue) }}</span>
            </div>
          </div>
        </div>

        <!-- Actual Revenue -->
        <div v-if="getActSummary.total_paid" class="detail-section">
          <h4>Thực thu</h4>
          <div class="detail-rows">
            <div class="detail-row">
              <span>Đã thu</span>
              <span class="font-semibold text-emerald-600">{{ formatCurrency(getActSummary.total_paid) }}</span>
            </div>
            <div class="detail-row">
              <span>Chờ thanh toán</span>
              <span>{{ formatCurrency(getActSummary.total_pending) }}</span>
            </div>
            <div class="detail-row">
              <span>Hoàn trả</span>
              <span class="text-red-500">-{{ formatCurrency(getActSummary.total_refund) }}</span>
            </div>
            <div class="detail-row border-t pt-2">
              <span class="font-semibold">Tổng thực thu</span>
              <span class="font-bold text-emerald-600">{{ formatCurrency(getActSummary.grand_total || getActSummary.net_actual) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment method breakdown -->
        <div v-if="getByPayment.length > 0" class="detail-section">
          <h4>Theo phương thức thanh toán</h4>
          <el-table :data="getByPayment" size="small" style="width: 100%">
            <el-table-column label="Phương thức">
              <template #default="{ row }">{{ paymentMethodLabel(row.method) }}</template>
            </el-table-column>
            <el-table-column label="Số đơn" prop="order_count" align="center" width="100" />
            <el-table-column label="Tổng tiền" align="right" width="160">
              <template #default="{ row }">{{ formatCurrency(row.total_amount) }}</template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Review info -->
        <div v-if="viewingReport.reviewed_by_name" class="meta-row" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb">
          <span><i class="fa-solid fa-user-check"></i> Người duyệt: <b>{{ viewingReport.reviewed_by_name }}</b></span>
          <span v-if="viewingReport.reviewed_at"><i class="fa-solid fa-clock"></i> {{ formatDateTime(viewingReport.reviewed_at) }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-if="viewingReport?.status === 'submitted'"
            type="success"
            @click="handleStatusChange(viewingReport, 'approved'); isViewModalVisible = false"
          >
            <el-icon class="mr-1"><Check /></el-icon> Duyệt
          </el-button>
          <el-button
            v-if="viewingReport?.status === 'submitted'"
            type="danger"
            @click="handleStatusChange(viewingReport, 'rejected'); isViewModalVisible = false"
          >
            <el-icon class="mr-1"><Close /></el-icon> Từ chối
          </el-button>
          <el-button @click="isViewModalVisible = false">Đóng</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import {
  Search,
  Delete,
  View,
  DataAnalysis,
  Tickets,
  Loading,
  Check,
  Close,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getSubmittedReports,
  updateReportStatus,
} from "@/services/reportService";

const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  loadReports();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

const search = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;
const loading = ref(false);
const reports = ref([]);
const totalReports = ref(0);

const isViewModalVisible = ref(false);
const viewingReport = ref(null);

// Computed for safely accessing JSONB data in view dialog
const getRevSummary = computed(() => {
  if (!viewingReport.value) return {};
  return viewingReport.value.revenue_summary || {};
});
const getActSummary = computed(() => {
  if (!viewingReport.value) return {};
  return viewingReport.value.actual_summary || {};
});
const getByPayment = computed(() => {
  if (!viewingReport.value) return [];
  return viewingReport.value.by_payment_method || [];
});

async function loadReports() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize,
    };
    if (search.value) params.search = search.value;
    if (statusFilter.value) params.status = statusFilter.value;

    const { data: res } = await getSubmittedReports(params);
    if (res.success) {
      reports.value = res.data;
      totalReports.value = res.pagination?.total || 0;
    }
  } catch (e) {
    console.error("Load submitted reports error:", e);
    ElMessage.error("Lỗi khi tải danh sách báo cáo");
  } finally {
    loading.value = false;
  }
}

function viewReport(report) {
  viewingReport.value = report;
  isViewModalVisible.value = true;
}

async function handleStatusChange(report, newStatus) {
  const label = newStatus === "approved" ? "duyệt" : "từ chối";
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn ${label} báo cáo "${report.report_code}"?`,
      "Xác nhận",
      {
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        type: newStatus === "approved" ? "success" : "warning",
      }
    );

    const { data: res } = await updateReportStatus(report.id, newStatus);
    if (res.success) {
      ElMessage.success(res.message);
      loadReports();
    }
  } catch (e) {
    if (e !== "cancel") {
      console.error("Update status error:", e);
      ElMessage.error("Lỗi khi cập nhật trạng thái");
    }
  }
}

function statusType(status) {
  const map = { submitted: "warning", approved: "success", rejected: "danger" };
  return map[status] || "info";
}

function statusLabel(status) {
  const map = { submitted: "Đã nộp", approved: "Đã duyệt", rejected: "Từ chối" };
  return map[status] || status;
}

function formatCurrency(value) {
  if (!value && value !== 0) return "0đ";
  return Math.round(parseFloat(value)).toLocaleString("vi-VN") + "đ";
}

function formatDateVN(d) {
  if (!d) return "";
  const str = String(d).slice(0, 10);
  const parts = str.split("-");
  if (parts.length !== 3) return str;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatDateTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function paymentMethodLabel(m) {
  const map = {
    cash: "Tiền mặt",
    card: "Thẻ",
    transfer: "Chuyển khoản",
    "bank transfer": "Chuyển khoản",
    bank_transfer: "Chuyển khoản",
    qr: "QR Code",
    momo: "MoMo",
    zalopay: "ZaloPay",
    vnpay: "VNPay",
  };
  return map[m] || m || "Khác";
}
</script>

<style scoped>
.report-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 6px;
}
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
.empty-state {
  padding: 60px 20px;
  text-align: center;
}
.filters-bar {
  justify-content: space-between;
}
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
.report-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.code-badge {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 6px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 16px;
}
.meta-row i {
  margin-right: 4px;
  color: #9ca3af;
}
.notes-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.85rem;
  color: #92400e;
  margin-bottom: 16px;
}
.notes-box i {
  margin-right: 6px;
  color: #d97706;
}
.detail-section {
  margin-top: 20px;
}
.detail-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f3f4f6;
}
.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #4b5563;
}
.dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  color: #111827;
  font-size: 14px;
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
.top-spent-value {
  font-weight: 600;
  color: #059669;
}
.report-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.detail-card {
  padding: 16px;
  border-radius: 10px;
  text-align: center;
}
.detail-card.blue { background: #eff6ff; }
.detail-card.green { background: #ecfdf5; }
.detail-card.orange { background: #fff7ed; }
.detail-card.purple { background: #f5f3ff; }
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
.page-container :deep(.el-button) { border-radius: 6px; font-weight: 500; }
.page-container :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}
:deep(.el-form-item__content) { width: 100%; }

@media (min-width: 768px) {
  .page-container { padding: 24px 32px; }
  .page-title { font-size: 1.75rem; }
  .filters-bar { padding: 16px 20px; }
  .pagination-container { justify-content: flex-end; }
  .page-container :deep(.el-button--primary) { background-color: #2563eb; border-color: #2563eb; }
  .page-container :deep(.el-table th) { background-color: #f9fafb !important; color: #6b7280; font-weight: 600; }
  .page-container :deep(.el-table td.el-table__cell) { border-bottom: 1px solid #f3f4f6; padding: 14px 0; }
  .page-container :deep(.el-table .el-table__row:hover > td) { background-color: #f9fafb !important; }
  .page-container :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) { background-color: #2563eb; }
}
</style>
