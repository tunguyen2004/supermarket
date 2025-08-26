<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Đơn hàng nháp</h1>
      <el-button type="primary" :icon="Plus" @click="createDraftOrder"
        >Tạo đơn nháp</el-button
      >
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo mã nháp, tên khách..."
          clearable
          :prefix-icon="Search"
        />
        <el-date-picker
          v-if="!isMobile"
          v-model="dateRange"
          type="daterange"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
        />
      </div>

      <!-- DESKTOP TABLE -->
      <el-table
        v-if="!isMobile"
        :data="pagedDrafts"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column prop="draftCode" label="Mã đơn nháp" width="150" />
        <el-table-column prop="createdBy" label="Người tạo" width="150" />
        <el-table-column
          prop="customerName"
          label="Khách hàng"
          min-width="180"
        />
        <el-table-column prop="createdDate" label="Ngày tạo" width="160" />
        <el-table-column label="Giá trị" width="150" align="right">
          <template #default="scope">
            <span class="total-amount">{{
              formatCurrency(scope.row.totalAmount)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="240" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                type="primary"
                :icon="ShoppingCartFull"
                @click="completeDraft(scope.row)"
                >Hoàn tất đơn</el-button
              >

              <el-dropdown trigger="click">
                <el-button
                  size="small"
                  :icon="MoreFilled"
                  circle
                  text
                  style="margin-left: 8px"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      :icon="Promotion"
                      @click="sendPaymentLink(scope.row)"
                      >Gửi link thanh toán</el-dropdown-item
                    >
                    <el-dropdown-item
                      :icon="View"
                      @click="openDetail(scope.row)"
                      >Xem chi tiết</el-dropdown-item
                    >
                    <el-dropdown-item
                      :icon="Delete"
                      class="delete-action"
                      @click="deleteDraft(scope.row)"
                      >Xóa</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- MOBILE LIST -->
      <div v-else class="mobile-card-list">
        <div
          v-for="item in pagedDrafts"
          :key="item.draftCode"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title">{{ item.customerName }}</div>
            <div class="card-subtitle">{{ item.draftCode }}</div>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Người tạo</span
              ><span class="card-value">{{ item.createdBy }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Ngày tạo</span
              ><span class="card-value">{{ item.createdDate }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Giá trị</span
              ><span class="card-value total-amount">{{
                formatCurrency(item.totalAmount)
              }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              type="primary"
              :icon="ShoppingCartFull"
              @click="completeDraft(item)"
              >Hoàn tất</el-button
            >
            <el-button size="small" text @click="sendPaymentLink(item)"
              >Gửi link</el-button
            >
            <el-button size="small" text @click="openDetail(item)"
              >Xem</el-button
            >
            <el-button
              size="small"
              text
              type="danger"
              @click="deleteDraft(item)"
              >Xóa</el-button
            >
          </div>
        </div>
      </div>

      <el-empty v-if="!isLoading && pagedDrafts.length === 0">
        <template #description>
          <div class="orders-empty-title">Chưa có đơn nháp nào.</div>
          <p class="orders-empty-desc">
            Bạn có thể tạo nhanh đơn nháp để giữ thông tin trước khi chốt đơn.
          </p>
        </template>
      </el-empty>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-if="filteredDrafts.length > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredDrafts.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- DETAIL DIALOG -->
    <el-dialog v-model="detailVisible" title="Chi tiết đơn nháp" width="560">
      <div v-if="selectedDraft" class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Mã nháp:</span
          ><span class="detail-value">{{ selectedDraft.draftCode }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Khách hàng:</span
          ><span class="detail-value">{{ selectedDraft.customerName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Người tạo:</span
          ><span class="detail-value">{{ selectedDraft.createdBy }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ngày tạo:</span
          ><span class="detail-value">{{ selectedDraft.createdDate }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Giá trị:</span
          ><span class="detail-value">{{
            formatCurrency(selectedDraft.totalAmount)
          }}</span>
        </div>
        <div class="detail-row" v-if="selectedDraft.note">
          <span class="detail-label">Ghi chú:</span
          ><span class="detail-value">{{ selectedDraft.note }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">Đóng</el-button>
          <el-button @click="sendPaymentLink(selectedDraft)" :icon="Promotion"
            >Gửi link</el-button
          >
          <el-button
            type="primary"
            :icon="ShoppingCartFull"
            @click="completeDraft(selectedDraft)"
            >Hoàn tất</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- CREATE DIALOG -->
    <el-dialog v-model="createVisible" title="Tạo đơn nháp" width="560">
      <el-form
        ref="createFormRef"
        :model="form"
        :rules="rules"
        label-width="130px"
      >
        <el-form-item label="Khách hàng" prop="customerName">
          <el-input v-model="form.customerName" placeholder="Tên khách hàng" />
        </el-form-item>
        <el-form-item label="Giá trị" prop="totalAmount">
          <el-input
            v-model.number="form.totalAmount"
            type="number"
            min="0"
            placeholder="0"
          />
        </el-form-item>
        <el-form-item label="Người tạo" prop="createdBy">
          <el-input v-model="form.createdBy" placeholder="VD: Nhân viên A" />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú nội bộ"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createVisible = false">Huỷ</el-button>
          <el-button type="primary" :loading="creating" @click="submitCreate"
            >Tạo</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import {
  Search,
  Plus,
  Promotion,
  ShoppingCartFull,
  Delete,
  MoreFilled,
  View,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";

// --- STATE ---
const isMobile = ref(false);
const isLoading = ref(true);
const search = ref("");
const dateRange = ref("");
const currentPage = ref(1);
const pageSize = 10;
const drafts = ref([]);

// --- MOCK DATA ---
const sampleDrafts = [
  {
    draftCode: "DRAFT001",
    createdBy: "Nhân viên A",
    customerName: "Nguyễn Văn An",
    createdDate: "2025-08-08 11:05",
    totalAmount: 150000,
    note: "",
  },
  {
    draftCode: "DRAFT002",
    createdBy: "Admin",
    customerName: "Khách vãng lai",
    createdDate: "2025-08-07 16:20",
    totalAmount: 320000,
    note: "Khách cần xác nhận số điện thoại",
  },
  {
    draftCode: "DRAFT003",
    createdBy: "Nhân viên B",
    customerName: "Trần Thị Bích",
    createdDate: "2025-08-06 09:30",
    totalAmount: 85000,
    note: "",
  },
];

// --- RESPONSIVE ---
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  setTimeout(() => {
    drafts.value = sampleDrafts;
    isLoading.value = false;
  }, 500);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// --- HELPERS ---
const formatCurrency = (value) => (value ?? 0).toLocaleString("vi-VN") + "đ";
const withinRange = (dateStr) => {
  if (!dateRange.value || dateRange.value.length !== 2) return true;
  const [start, end] = dateRange.value;
  return dateStr.slice(0, 10) >= start && dateStr.slice(0, 10) <= end;
};

// --- FILTERING/PAGING ---
const filteredDrafts = computed(() => {
  const q = search.value.trim().toLowerCase();
  return drafts.value.filter((item) => {
    const searchMatch = q
      ? item.draftCode.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        (item.createdBy || "").toLowerCase().includes(q)
      : true;
    const dateMatch = withinRange(item.createdDate);
    return searchMatch && dateMatch;
  });
});

const pagedDrafts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredDrafts.value.slice(start, start + pageSize);
});

watch([search, dateRange], () => {
  currentPage.value = 1;
});

// --- DETAIL DIALOG ---
const selectedDraft = ref(null);
const detailVisible = ref(false);
const openDetail = (row) => {
  selectedDraft.value = row;
  detailVisible.value = true;
};

// --- ACTIONS ---
const buildPaymentLink = (row) =>
  `https://example.com/pay/${encodeURIComponent(row.draftCode)}`;

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

const sendPaymentLink = async (row) => {
  if (!row) return;
  const link = buildPaymentLink(row);
  const ok = await copyToClipboard(link);
  if (ok)
    ElNotification({
      title: "Đã sao chép",
      message: `Link thanh toán: ${link}`,
      type: "success",
    });
  else
    ElMessageBox.alert(
      `<div>Không thể sao chép tự động. Copy thủ công link sau:</div><pre style="margin-top:8px;white-space:break-spaces">${link}</pre>`,
      "Sao chép thất bại",
      { dangerouslyUseHTMLString: true }
    );
};

const completeDraft = async (row) => {
  try {
    await ElMessageBox.confirm(
      `Xác nhận hoàn tất đơn nháp ${row.draftCode}?`,
      "Xác nhận",
      {
        type: "warning",
        confirmButtonText: "Hoàn tất",
        cancelButtonText: "Huỷ",
      }
    );
  } catch {
    return;
  }
  isLoading.value = true;
  // mock API convert to order
  setTimeout(() => {
    // giả sử chuyển đơn nháp thành đơn chính và xóa khỏi danh sách nháp
    drafts.value = drafts.value.filter((d) => d.draftCode !== row.draftCode);
    ElNotification({
      title: "Thành công",
      message: "Đơn nháp đã được chuyển thành đơn hàng.",
      type: "success",
    });
    isLoading.value = false;
    detailVisible.value = false;
  }, 700);
};

const deleteDraft = async (row) => {
  try {
    await ElMessageBox.confirm(
      `Xoá đơn nháp ${row.draftCode}?`,
      "Xác nhận xoá",
      { type: "warning", confirmButtonText: "Xoá", cancelButtonText: "Huỷ" }
    );
  } catch {
    return;
  }
  isLoading.value = true;
  setTimeout(() => {
    drafts.value = drafts.value.filter((d) => d.draftCode !== row.draftCode);
    ElMessage.success("Đã xoá đơn nháp");
    isLoading.value = false;
  }, 500);
};

// --- CREATE DIALOG ---
const createVisible = ref(false);
const creating = ref(false);
const createFormRef = ref();
const nowStr = () => new Date().toISOString().slice(0, 16).replace("T", " ");
const form = ref({
  customerName: "",
  totalAmount: 0,
  createdBy: "Bạn",
  note: "",
});

const rules = {
  customerName: [
    { required: true, message: "Vui lòng nhập tên khách", trigger: "blur" },
  ],
  totalAmount: [
    { required: true, message: "Vui lòng nhập giá trị", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "Số tiền không hợp lệ",
      trigger: "blur",
    },
  ],
  createdBy: [
    { required: true, message: "Vui lòng nhập người tạo", trigger: "blur" },
  ],
};

const createDraftOrder = () => {
  createVisible.value = true;
  Object.assign(form.value, {
    customerName: "",
    totalAmount: 0,
    createdBy: "Bạn",
    note: "",
  });
  createFormRef.value?.clearValidate?.();
};

const nextCode = () => {
  const nums = drafts.value.map(
    (d) => Number(d.draftCode.replace(/\D/g, "")) || 0
  );
  const next = Math.max(0, ...nums) + 1;
  return "DRAFT" + String(next).padStart(3, "0");
};

const submitCreate = () => {
  createFormRef.value.validate((valid) => {
    if (!valid) return;
    creating.value = true;
    setTimeout(() => {
      drafts.value.unshift({
        draftCode: nextCode(),
        createdBy: form.value.createdBy.trim(),
        customerName: form.value.customerName.trim(),
        createdDate: nowStr(),
        totalAmount: Number(form.value.totalAmount) || 0,
        note: form.value.note?.trim() || "",
      });
      ElNotification({
        title: "Đã tạo",
        message: "Tạo đơn nháp thành công",
        type: "success",
      });
      creating.value = false;
      createVisible.value = false;
    }, 600);
  });
};
</script>

<style scoped>
.total-amount {
  font-weight: 600;
  color: #1f2937;
}
.filters-bar {
  justify-content: space-between;
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
  margin-bottom: 20px;
  line-height: 1.5;
}
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.delete-action {
  color: var(--el-color-danger);
}
.delete-action:hover {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
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
.card-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
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
  display: contents;
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
    max-width: 400px;
  }
  .page-container
    :deep(
      .el-pagination.is-background .el-pager li:not(.is-disabled).is-active
    ) {
    background-color: #2563eb;
  }
}
</style>
