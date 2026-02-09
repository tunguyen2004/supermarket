<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Đơn trả hàng</h1>
      <el-button type="primary" :icon="Plus" @click="createReturnOrder">
        Tạo đơn trả hàng
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo mã phiếu, mã đơn gốc, tên khách..."
          clearable
          :prefix-icon="Search"
        />
        <el-select
          v-if="!isMobile"
          v-model="statusFilter"
          placeholder="Trạng thái"
          clearable
        >
          <el-option label="Chờ xử lý" value="Chờ xử lý"></el-option>
          <el-option label="Đã hoàn tiền" value="Đã hoàn tiền"></el-option>
          <el-option label="Đã nhập kho" value="Đã nhập kho"></el-option>
          <el-option label="Đã từ chối" value="Đã từ chối"></el-option>
        </el-select>
      </div>

      <!-- DESKTOP TABLE -->
      <el-table
        v-if="!isMobile"
        :data="pagedReturns"
        style="width: 100%"
        v-loading="isLoading"
      >
        <el-table-column prop="returnCode" label="Mã phiếu trả" width="140" />
        <el-table-column prop="originalOrderCode" label="Đơn gốc" width="120" />
        <el-table-column
          prop="customerName"
          label="Khách hàng"
          min-width="180"
        />
        <el-table-column prop="returnDate" label="Ngày trả" width="150" />
        <el-table-column label="Tiền hoàn trả" width="160" align="right">
          <template #default="scope">
            <span class="refund-amount">{{
              formatCurrency(scope.row.refundAmount)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="150" align="center">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              effect="light"
              size="small"
              >{{ scope.row.status }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="160" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="View"
                text
                bg
                @click="openDetail(scope.row)"
                >Xem</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- MOBILE LIST -->
      <div v-else class="mobile-card-list">
        <div
          v-for="item in pagedReturns"
          :key="item.returnCode"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-title">Khách: {{ item.customerName }}</span>
              <span class="card-subtitle">Mã phiếu: {{ item.returnCode }}</span>
            </div>
            <el-tag
              :type="getStatusType(item.status)"
              effect="light"
              size="small"
              >{{ item.status }}</el-tag
            >
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Đơn gốc</span
              ><span class="card-value">{{ item.originalOrderCode }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Ngày trả</span
              ><span class="card-value">{{ item.returnDate }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Tiền hoàn trả</span
              ><span class="card-value refund-amount">{{
                formatCurrency(item.refundAmount)
              }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="View"
              text
              bg
              @click="openDetail(item)"
              >Xem chi tiết</el-button
            >
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && pagedReturns.length === 0"
        description="Không có đơn trả hàng nào"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        v-if="filteredReturns.length > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredReturns.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- DETAIL DIALOG -->
    <el-dialog
      v-model="detailVisible"
      title="Chi tiết đơn trả hàng"
      width="560"
    >
      <div v-if="selectedReturn" class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Mã phiếu:</span
          ><span class="detail-value">{{ selectedReturn.returnCode }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Đơn gốc:</span
          ><span class="detail-value">{{
            selectedReturn.originalOrderCode
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Khách hàng:</span
          ><span class="detail-value">{{ selectedReturn.customerName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ngày trả:</span
          ><span class="detail-value">{{ selectedReturn.returnDate }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tiền hoàn:</span
          ><span class="detail-value">{{
            formatCurrency(selectedReturn.refundAmount)
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trạng thái:</span
          ><el-tag
            :type="getStatusType(selectedReturn.status)"
            size="small"
            effect="light"
            >{{ selectedReturn.status }}</el-tag
          >
        </div>
        <div class="detail-row" v-if="selectedReturn.note">
          <span class="detail-label">Ghi chú:</span
          ><span class="detail-value">{{ selectedReturn.note }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">Đóng</el-button>
          <el-button
            v-if="selectedReturn?.status === 'Chờ xử lý'"
            @click="markAsWarehoused(selectedReturn)"
            >Nhập kho</el-button
          >
          <el-button
            type="success"
            v-if="
              selectedReturn &&
              (selectedReturn.status === 'Chờ xử lý' ||
                selectedReturn.status === 'Đã nhập kho')
            "
            @click="markAsRefunded(selectedReturn)"
            >Hoàn tiền</el-button
          >
          <el-button
            type="danger"
            v-if="selectedReturn?.status === 'Chờ xử lý'"
            @click="rejectReturn(selectedReturn)"
            >Từ chối</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- CREATE DIALOG -->
    <el-dialog v-model="createVisible" title="Tạo đơn trả hàng" width="560">
      <el-form
        ref="createFormRef"
        :model="form"
        :rules="rules"
        label-width="130px"
      >
        <el-form-item label="Đơn gốc" prop="originalOrderCode">
          <el-input v-model="form.originalOrderCode" placeholder="VD: DH1234" />
        </el-form-item>
        <el-form-item label="Khách hàng" prop="customerName">
          <el-input v-model="form.customerName" placeholder="Tên khách" />
        </el-form-item>
        <el-form-item label="Ngày trả" prop="returnDate">
          <el-date-picker
            v-model="form.returnDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Chọn ngày"
          />
        </el-form-item>
        <el-form-item label="Tiền hoàn trả" prop="refundAmount">
          <el-input
            v-model.number="form.refundAmount"
            type="number"
            min="0"
            placeholder="0"
          />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="2"
            placeholder="Lý do, mô tả tình trạng hàng..."
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
import { Search, Plus, View } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import orderService from "@/services/orderService";

// --- RESPONSIVE STATE ---
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

// --- LOADING ---
const isLoading = ref(true);

// --- LIST/PAGINATION STATE ---
const search = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const returns = ref([]);

// --- FETCH DATA ---
const fetchReturns = async () => {
  try {
    isLoading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
    };

    const result = await orderService.getReturnOrders(params);

    // Map API response
    returns.value = result.data.map((item) => ({
      id: item.id,
      returnCode: item.return_code,
      originalOrderCode: item.original_order_code,
      customerName: item.customer_name,
      returnDate: new Date(item.return_date).toLocaleDateString("vi-VN"),
      refundAmount: item.refund_amount,
      status: item.status,
      note: item.note || "",
    }));

    totalItems.value = result.pagination?.total || 0;
  } catch (error) {
    console.error("Error fetching returns:", error);
    ElMessage.error("Không thể tải danh sách đơn trả hàng");
  } finally {
    isLoading.value = false;
  }
};

// --- MOUNT ---
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchReturns();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// --- UTILS ---
const formatCurrency = (value) => (value ?? 0).toLocaleString("vi-VN") + "đ";
const getStatusType = (status) => {
  if (status === "Đã hoàn tiền" || status === "Đã nhập kho") return "success";
  if (status === "Chờ xử lý") return "warning";
  if (status === "Đã từ chối") return "danger";
  return "info";
};

// search + filter + pagination
const filteredReturns = computed(() => {
  const q = search.value.trim().toLowerCase();
  return returns.value.filter((item) => {
    const searchMatch = q
      ? item.returnCode.toLowerCase().includes(q) ||
        item.originalOrderCode.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q)
      : true;
    const statusMatch = statusFilter.value
      ? item.status === statusFilter.value
      : true;
    return searchMatch && statusMatch;
  });
});

const pagedReturns = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredReturns.value.slice(start, start + pageSize);
});

watch([search, statusFilter], () => {
  currentPage.value = 1;
});

// --- DETAIL DIALOG ---
const selectedReturn = ref(null);
const detailVisible = ref(false);
const openDetail = (row) => {
  selectedReturn.value = row;
  detailVisible.value = true;
};

const markAsRefunded = async (row) => {
  try {
    await ElMessageBox.confirm(
      `Xác nhận đã hoàn tiền cho phiếu ${row.returnCode}?`,
      "Xác nhận",
      {
        type: "warning",
        confirmButtonText: "Đã hoàn",
        cancelButtonText: "Huỷ",
      },
    );
  } catch {
    return;
  }
  // mock API
  isLoading.value = true;
  setTimeout(() => {
    row.status = "Đã hoàn tiền";
    ElNotification({
      title: "Thành công",
      message: "Đã cập nhật trạng thái hoàn tiền.",
      type: "success",
    });
    isLoading.value = false;
  }, 600);
};

const markAsWarehoused = async (row) => {
  try {
    await ElMessageBox.confirm(
      `Xác nhận nhập kho hàng trả của phiếu ${row.returnCode}?`,
      "Xác nhận",
      {
        type: "warning",
        confirmButtonText: "Nhập kho",
        cancelButtonText: "Huỷ",
      },
    );
  } catch {
    return;
  }
  isLoading.value = true;
  setTimeout(() => {
    row.status = "Đã nhập kho";
    ElMessage.success("Đã cập nhật trạng thái: Đã nhập kho");
    isLoading.value = false;
  }, 600);
};

const rejectReturn = async (row) => {
  try {
    const { value, action } = await ElMessageBox.prompt(
      "Nhập lý do từ chối:",
      "Từ chối đơn trả",
      {
        confirmButtonText: "Từ chối",
        cancelButtonText: "Huỷ",
        inputPlaceholder: "VD: Hết thời hạn đổi trả",
      },
    );
    if (action === "confirm") {
      isLoading.value = true;
      setTimeout(() => {
        row.status = "Đã từ chối";
        row.note = value;
        ElMessage.warning("Đã từ chối đơn trả");
        isLoading.value = false;
      }, 600);
    }
  } catch {
    /* cancelled */
  }
};

// --- CREATE DIALOG ---
const createVisible = ref(false);
const creating = ref(false);
const createFormRef = ref();
const todayStr = () => new Date().toISOString().slice(0, 10);
const form = ref({
  originalOrderCode: "",
  customerName: "",
  returnDate: todayStr(),
  refundAmount: 0,
  note: "",
});

const rules = {
  originalOrderCode: [
    { required: true, message: "Vui lòng nhập mã đơn gốc", trigger: "blur" },
  ],
  customerName: [
    { required: true, message: "Vui lòng nhập tên khách", trigger: "blur" },
  ],
  returnDate: [
    { required: true, message: "Vui lòng chọn ngày trả", trigger: "change" },
  ],
  refundAmount: [
    { required: true, message: "Vui lòng nhập số tiền hoàn", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "Số tiền không hợp lệ",
      trigger: "blur",
    },
  ],
};

const createReturnOrder = () => {
  createVisible.value = true;
  // reset form mỗi lần mở
  Object.assign(form.value, {
    originalOrderCode: "",
    customerName: "",
    returnDate: todayStr(),
    refundAmount: 0,
    note: "",
  });
  createFormRef.value?.clearValidate?.();
};

const generateNextCode = () => {
  const nums = returns.value.map(
    (r) => Number(r.returnCode.replace(/\D/g, "")) || 0,
  );
  const next = Math.max(0, ...nums) + 1;
  return "RT" + String(next).padStart(3, "0");
};

const submitCreate = () => {
  createFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      creating.value = true;

      const returnData = {
        orderId: null, // Would need to lookup order by code
        returnDate: form.value.returnDate,
        refundAmount: Number(form.value.refundAmount) || 0,
        note: form.value.note?.trim() || "",
      };

      await orderService.createReturnOrder(returnData);

      ElNotification({
        title: "Đã tạo",
        message: "Tạo đơn trả hàng thành công",
        type: "success",
      });

      createVisible.value = false;
      await fetchReturns();
    } catch (error) {
      console.error("Error creating return:", error);
      ElMessage.error("Không thể tạo đơn trả hàng");
    } finally {
      creating.value = false;
    }
  });
};
</script>

<style scoped>
.refund-amount {
  font-weight: 600;
  color: #c026d3;
}
.filters-bar {
  justify-content: space-between;
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
