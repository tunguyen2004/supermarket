<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Đơn chưa hoàn tất</h1>
      <el-button
        :icon="Message"
        @click="sendMassEmail"
        :disabled="isLoading || massEmailDisabled"
      >
        Gửi email hàng loạt
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="search"
            placeholder="Tìm theo mã đơn, tên hoặc email khách..."
            clearable
            :prefix-icon="Search"
          />
        </div>
        <el-select
          v-if="!isMobile"
          v-model="statusFilter"
          placeholder="Trạng thái"
          clearable
        >
          <el-option label="Chưa liên hệ" value="Chưa liên hệ"></el-option>
          <el-option label="Đã gửi email" value="Đã gửi email"></el-option>
        </el-select>
      </div>

      <!-- DESKTOP TABLE -->
      <el-table
        v-if="!isMobile"
        :data="pagedCheckouts"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column prop="checkoutCode" label="Mã đơn" width="120" />
        <el-table-column label="Khách hàng" min-width="200">
          <template #default="scope">
            <div class="customer-cell">
              <div>{{ scope.row.customerName }}</div>
              <div class="customer-contact">
                {{ scope.row.customerContact }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdDate" label="Thời gian tạo" width="160" />
        <el-table-column label="Giá trị" width="150" align="right">
          <template #default="scope">
            <span class="total-amount">{{
              formatCurrency(scope.row.totalAmount)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="150" align="center">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              effect="light"
              size="small"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="160" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip content="Xem chi tiết" placement="top">
                <el-button
                  size="small"
                  :icon="View"
                  circle
                  @click="openDetail(scope.row)"
                />
              </el-tooltip>
              <el-tooltip content="Gửi link thanh toán" placement="top">
                <el-button
                  size="small"
                  :icon="Promotion"
                  type="primary"
                  circle
                  @click="sendPaymentLink(scope.row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- MOBILE LIST -->
      <div v-else class="mobile-card-list">
        <div
          v-for="item in pagedCheckouts"
          :key="item.checkoutCode"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-title">{{ item.customerName }}</span>
              <span class="card-subtitle">{{ item.customerContact }}</span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Mã đơn</span>
              <span class="card-value">{{ item.checkoutCode }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Thời gian</span>
              <span class="card-value">{{ item.createdDate }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Giá trị</span>
              <span class="card-value total-amount">{{
                formatCurrency(item.totalAmount)
              }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Trạng thái</span>
              <span class="card-value">
                <el-tag
                  :type="getStatusType(item.status)"
                  effect="light"
                  size="small"
                  >{{ item.status }}</el-tag
                >
              </span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="View"
              text
              bg
              @click="openDetail(item)"
              >Xem</el-button
            >
            <el-button
              size="small"
              :icon="Promotion"
              type="primary"
              plain
              @click="sendPaymentLink(item)"
              >Gửi Link</el-button
            >
          </div>
        </div>
      </div>

      <el-empty v-if="!isLoading && pagedCheckouts.length === 0">
        <template #description>
          <div class="orders-empty-title">
            Cửa hàng của bạn chưa có đơn chưa hoàn tất nào.
          </div>
          <p class="orders-empty-desc">
            Hệ thống tự động ghi nhận lại thông tin khi khách hàng đã đến trang
            thanh toán nhưng chưa hoàn tất.
          </p>
        </template>
      </el-empty>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-if="filteredCheckouts.length > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredCheckouts.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- DETAIL DIALOG -->
    <el-dialog
      v-model="detailVisible"
      title="Chi tiết đơn chưa hoàn tất"
      width="520"
    >
      <div v-if="selectedCheckout" class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Mã đơn:</span>
          <span class="detail-value">{{ selectedCheckout.checkoutCode }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Khách hàng:</span>
          <span class="detail-value">{{ selectedCheckout.customerName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Liên hệ:</span>
          <span class="detail-value">{{
            selectedCheckout.customerContact
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Thời gian tạo:</span>
          <span class="detail-value">{{ selectedCheckout.createdDate }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Giá trị:</span>
          <span class="detail-value">{{
            formatCurrency(selectedCheckout.totalAmount)
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trạng thái:</span>
          <el-tag
            :type="getStatusType(selectedCheckout.status)"
            effect="light"
            size="small"
            >{{ selectedCheckout.status }}</el-tag
          >
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">Đóng</el-button>
          <el-button
            type="primary"
            :icon="Promotion"
            @click="sendPaymentLink(selectedCheckout)"
            >Gửi link thanh toán</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { Search, Message, View, Promotion } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import checkoutService from "@/services/checkoutService";

// --- STATE ---
const isMobile = ref(false);
const isLoading = ref(true);
const search = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const checkouts = ref([]);

// Dialog state
const selectedCheckout = ref(null);
const detailVisible = ref(false);

// --- FETCH DATA ---
const fetchCheckouts = async () => {
  try {
    isLoading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
    };

    const result = await checkoutService.getCheckouts(params);

    // Map API response to display format
    checkouts.value = result.data.map((item) => ({
      id: item.id,
      checkoutCode: item.checkoutCode,
      customerName: item.customerName,
      customerContact: item.customerContact,
      createdDate: new Date(item.createdDate).toLocaleString("vi-VN"),
      totalAmount: item.totalAmount,
      status: item.status,
    }));

    totalItems.value = result.pagination?.total || 0;
  } catch (error) {
    console.error("Error fetching checkouts:", error);
    ElMessage.error("Không thể tải danh sách đơn chưa hoàn tất");
  } finally {
    isLoading.value = false;
  }
};

// --- HELPERS ---
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
const formatCurrency = (value) => (value ?? 0).toLocaleString("vi-VN") + "đ";
const getStatusType = (status) =>
  status === "Đã gửi email" ? "success" : "warning";

// Derived lists
const filteredCheckouts = computed(() => {
  return checkouts.value.filter((item) => {
    const q = (search.value || "").toLowerCase().trim();
    const searchMatch = q
      ? item.checkoutCode.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        (item.customerContact || "").toLowerCase().includes(q)
      : true;
    const statusMatch = statusFilter.value
      ? item.status === statusFilter.value
      : true;
    return searchMatch && statusMatch;
  });
});

const pagedCheckouts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredCheckouts.value.slice(start, start + pageSize);
});

const massTargets = computed(() =>
  filteredCheckouts.value.filter((c) => c.status !== "Đã gửi email"),
);
const massEmailDisabled = computed(() => massTargets.value.length === 0);

// --- ACTIONS ---
const openDetail = (row) => {
  selectedCheckout.value = row;
  detailVisible.value = true;
};

const buildPaymentLink = (row) => {
  // TODO: thay domain thật khi tích hợp backend
  return `https://example.com/checkout/${encodeURIComponent(row.checkoutCode)}`;
};

const markAsEmailed = (ids = []) => {
  // Refresh data after sending email
  checkouts.value = checkouts.value.map((c) =>
    ids.includes(c.id) ? { ...c, status: "Đã gửi email" } : c,
  );
};

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch (e) {
    return false;
  }
};

const sendPaymentLink = async (row) => {
  if (!row) return;
  try {
    isLoading.value = true;
    const result = await checkoutService.sendPaymentLink(row.id);

    // Copy link to clipboard
    const copied = await copyToClipboard(result.payment_link);

    if (copied) {
      ElNotification({
        title: "Thành công",
        message: `Đã copy link thanh toán vào clipboard`,
        type: "success",
        duration: 3000,
      });
      markAsEmailed([row.id]);
    } else {
      ElMessageBox.alert(
        `Link thanh toán: ${result.payment_link}`,
        "Link thanh toán",
      );
    }
  } catch (error) {
    console.error("Error sending payment link:", error);
    ElMessage.error("Không thể gửi link thanh toán");
  } finally {
    isLoading.value = false;
  }
};

const sendMassEmail = async () => {
  const totalTargets = massTargets.value.length;
  if (totalTargets === 0) {
    ElMessage.warning("Không có đơn nào cần gửi email.");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `Gửi email nhắc thanh toán cho ${totalTargets} đơn chưa liên hệ?`,
      "Xác nhận",
      { confirmButtonText: "Gửi", cancelButtonText: "Huỷ", type: "warning" },
    );
  } catch {
    return; // user canceled
  }

  isLoading.value = true;
  try {
    const payload = {
      checkout_ids: massTargets.value.map((c) => c.id),
      exclude_already_sent: true,
    };
    const result = await checkoutService.sendMassEmail(payload);

    ElNotification({
      title: "Thành công",
      message: `Đã gửi email cho ${result.sent_count} đơn hàng`,
      type: "success",
      duration: 3000,
    });

    // Refresh data
    await fetchCheckouts();
  } catch (error) {
    console.error("Error sending mass email:", error);
    ElMessage.error("Không thể gửi email hàng loạt");
  } finally {
    isLoading.value = false;
  }
};

watch([search, statusFilter], () => {
  currentPage.value = 1;
  fetchCheckouts();
});

watch(currentPage, () => {
  fetchCheckouts();
});

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchCheckouts();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<style scoped>
/* @import './responsive-style.css'; Sử dụng file CSS chung */

/* === SỬA ĐỔI: CSS cho bộ lọc và cột thao tác === */
.filters-bar {
  display: flex;
  gap: 16px;
  justify-content: space-between;
}
.search-input-wrapper {
  flex-grow: 1; /* Cho phép ô input co giãn */
}
/* ============================================== */

.total-amount {
  font-weight: 600;
  color: #1f2937;
}
.customer-cell {
  font-weight: 500;
}
.customer-contact {
  font-size: 0.8rem;
  color: #6b7280;
}
.orders-empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}
.orders-empty-desc {
  font-size: 0.9rem;
  color: #6b7280;
  max-width: 400px;
  margin-top: 8px;
  line-height: 1.5;
}
.card-title-group {
  display: flex;
  flex-direction: column;
}
.card-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 400;
  margin-top: 2px;
}
.mobile-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

/* ----- DETAIL DIALOG ----- */
.detail-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  row-gap: 10px;
  column-gap: 12px;
}
.detail-row {
  display: contents; /* label-value trên 2 cột */
}
.detail-label {
  color: #6b7280;
}
.detail-value {
  color: #111827;
  font-weight: 500;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
