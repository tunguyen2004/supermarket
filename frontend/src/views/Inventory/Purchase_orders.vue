<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Đơn đặt hàng nhập</h1>
      <div class="action-buttons-group">
        <el-button type="primary" :icon="Plus" @click="openCreateDialog"
          >Tạo đơn nhập hàng</el-button
        >
      </div>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="search"
            placeholder="Tìm theo mã giao dịch, sản phẩm..."
            clearable
            :prefix-icon="Search"
          />
        </div>
        <div v-if="!isMobile" class="advanced-filters">
          <el-select
            v-model="storeFilter"
            placeholder="Chi nhánh"
            clearable
            class="adv-select"
          >
            <el-option
              v-for="s in stores"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            value-format="YYYY-MM-DD"
            class="adv-date"
          />
        </div>
      </div>

      <!-- DESKTOP TABLE -->
      <el-table
        v-if="!isMobile"
        :data="transactions"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column
          prop="transaction_code"
          label="Mã giao dịch"
          width="190"
        />
        <el-table-column label="Sản phẩm" min-width="200">
          <template #default="scope">
            <div>
              <div style="font-weight: 600">{{ scope.row.product_name }}</div>
              <div style="color: #6b7280; font-size: 0.85em">
                {{ scope.row.sku }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="store_name" label="Chi nhánh" width="170" />
        <el-table-column label="Ngày nhập" width="130">
          <template #default="scope">{{ scope.row.date_key }}</template>
        </el-table-column>
        <el-table-column label="Số lượng" width="110" align="right">
          <template #default="scope">
            <span style="font-weight: 600; color: #10b981"
              >+{{ scope.row.quantity_change }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="Đơn giá" width="130" align="right">
          <template #default="scope">{{
            formatCurrency(scope.row.unit_cost)
          }}</template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="150" align="right">
          <template #default="scope">
            <span class="total-amount">{{
              formatCurrency(scope.row.total_value)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_by_name"
          label="Người nhập"
          width="140"
        />
        <el-table-column label="" width="80" align="center">
          <template #default="scope">
            <el-button
              size="small"
              :icon="View"
              text
              bg
              @click="openDetail(scope.row)"
              >Xem</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- MOBILE LIST -->
      <div v-else class="mobile-card-list">
        <div
          v-for="item in transactions"
          :key="item.id"
          class="mobile-card"
          @click="openDetail(item)"
        >
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-title">{{ item.transaction_code }}</span>
              <span class="card-subtitle">{{ item.product_name }}</span>
            </div>
            <el-tag type="success" effect="light" size="small">Đã nhập</el-tag>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Chi nhánh</span>
              <span class="card-value">{{ item.store_name }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Ngày nhập</span>
              <span class="card-value">{{ item.date_key }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Số lượng</span>
              <span class="card-value" style="color: #10b981; font-weight: 600"
                >+{{ item.quantity_change }}</span
              >
            </div>
            <div class="card-row">
              <span class="card-label">Thành tiền</span>
              <span class="card-value total-amount">{{
                formatCurrency(item.total_value)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && transactions.length === 0"
        description="Chưa có giao dịch nhập hàng nào"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        v-if="totalItems > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="totalItems"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- DETAIL DIALOG -->
    <el-dialog
      v-model="detailVisible"
      :title="`Chi tiết · ${selectedTx?.transaction_code || ''}`"
      width="720"
    >
      <div v-if="selectedTx" class="detail-grid">
        <div class="drow">
          <span class="dl">Mã giao dịch</span
          ><span class="dv">{{ selectedTx.transaction_code }}</span>
        </div>
        <div class="drow">
          <span class="dl">Sản phẩm</span
          ><span class="dv"
            >{{ selectedTx.product_name }} ({{ selectedTx.variant_name }})</span
          >
        </div>
        <div class="drow">
          <span class="dl">SKU</span
          ><span class="dv">{{ selectedTx.sku }}</span>
        </div>
        <div class="drow">
          <span class="dl">Chi nhánh</span
          ><span class="dv">{{ selectedTx.store_name }}</span>
        </div>
        <div class="drow">
          <span class="dl">Ngày nhập</span
          ><span class="dv">{{ selectedTx.date_key }}</span>
        </div>
        <div class="drow">
          <span class="dl">Số lượng nhập</span
          ><span class="dv" style="color: #10b981; font-weight: 700"
            >+{{ selectedTx.quantity_change }}</span
          >
        </div>
        <div class="drow">
          <span class="dl">Đơn giá</span
          ><span class="dv">{{ formatCurrency(selectedTx.unit_cost) }}</span>
        </div>
        <div class="drow">
          <span class="dl">Thành tiền</span
          ><span class="dv">{{ formatCurrency(selectedTx.total_value) }}</span>
        </div>
        <div class="drow">
          <span class="dl">Tồn trước</span
          ><span class="dv">{{ selectedTx.balance_before }}</span>
        </div>
        <div class="drow">
          <span class="dl">Tồn sau</span
          ><span class="dv">{{ selectedTx.balance_after }}</span>
        </div>
        <div class="drow">
          <span class="dl">Người nhập</span
          ><span class="dv">{{ selectedTx.created_by_name }}</span>
        </div>
        <div class="drow">
          <span class="dl">Ghi chú</span
          ><span class="dv">{{ selectedTx.notes || "—" }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">Đóng</el-button>
      </template>
    </el-dialog>

    <!-- CREATE DIALOG -->
    <el-dialog
      v-model="createVisible"
      title="Tạo đơn nhập hàng"
      width="800"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="form"
        :rules="rules"
        label-width="140px"
      >
        <el-form-item label="Chi nhánh nhận" prop="store_id">
          <el-select
            v-model="form.store_id"
            placeholder="Chọn chi nhánh"
            style="width: 100%"
          >
            <el-option
              v-for="s in stores"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú (tuỳ chọn)"
          />
        </el-form-item>
      </el-form>

      <div style="margin-top: 16px">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          "
        >
          <span style="font-weight: 600; font-size: 1rem"
            >Danh sách sản phẩm nhập</span
          >
          <el-button :icon="Plus" size="small" @click="addItem"
            >Thêm dòng</el-button
          >
        </div>
        <el-table :data="form.items" border size="small">
          <el-table-column label="Variant ID" width="120">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.variant_id"
                :min="1"
                size="small"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="Số lượng" width="120">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                size="small"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="Đơn giá nhập" width="150">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.unit_cost"
                :min="0"
                :step="1000"
                size="small"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="Thành tiền" width="140" align="right">
            <template #default="scope">
              <span style="font-weight: 600">{{
                formatCurrency(
                  (scope.row.quantity || 0) * (scope.row.unit_cost || 0),
                )
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="" width="60" align="center">
            <template #default="scope">
              <el-button
                :icon="Delete"
                size="small"
                text
                type="danger"
                @click="removeItem(scope.$index)"
              />
            </template>
          </el-table-column>
        </el-table>
        <div class="total-row">
          Tổng: <span class="grand-total">{{ formatCurrency(formTotal) }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="createVisible = false">Huỷ</el-button>
        <el-button
          type="primary"
          :loading="creating"
          @click="submitCreate"
          :disabled="form.items.length === 0"
          >Nhập kho</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { ElMessage, ElNotification } from "element-plus";
import { Search, Plus, View, Delete } from "@element-plus/icons-vue";
import inventoryService from "@/services/inventoryService";

// --- Responsive ---
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchData();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// --- State ---
const isLoading = ref(false);
const search = ref("");
const dateRange = ref("");
const storeFilter = ref("");
const currentPage = ref(1);
const pageSize = 20;
const totalItems = ref(0);
const transactions = ref([]);
const stores = ref([]);

// --- Fetch data ---
async function fetchData() {
  try {
    isLoading.value = true;
    const [storesRes, txRes] = await Promise.all([
      inventoryService.getStores(),
      inventoryService.getTransactions(buildParams()),
    ]);
    stores.value = storesRes.data || [];
    transactions.value = txRes.data || [];
    totalItems.value = txRes.pagination?.total || 0;
  } catch (error) {
    console.error("Error loading data:", error);
    ElMessage.error("Không thể tải dữ liệu");
  } finally {
    isLoading.value = false;
  }
}

function buildParams() {
  const params = { type: "IMPORT", page: currentPage.value, limit: pageSize };
  if (search.value.trim()) params.search = search.value.trim();
  if (storeFilter.value) params.store_id = storeFilter.value;
  if (Array.isArray(dateRange.value) && dateRange.value.length === 2) {
    params.from = dateRange.value[0];
    params.to = dateRange.value[1];
  }
  return params;
}

async function fetchTransactions() {
  try {
    isLoading.value = true;
    const res = await inventoryService.getTransactions(buildParams());
    transactions.value = res.data || [];
    totalItems.value = res.pagination?.total || 0;
  } catch (error) {
    console.error("Error fetching transactions:", error);
  } finally {
    isLoading.value = false;
  }
}

// Debounce search
let searchTimer = null;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchTransactions();
  }, 400);
});
watch([storeFilter, dateRange], () => {
  currentPage.value = 1;
  fetchTransactions();
});
watch(currentPage, () => {
  fetchTransactions();
});

// --- Helpers ---
const formatCurrency = (value) => (value ?? 0).toLocaleString("vi-VN") + "đ";

// --- Detail dialog ---
const detailVisible = ref(false);
const selectedTx = ref(null);
const openDetail = (row) => {
  selectedTx.value = row;
  detailVisible.value = true;
};

// --- Create dialog ---
const createVisible = ref(false);
const creating = ref(false);
const createFormRef = ref();
const form = reactive({ store_id: "", notes: "", items: [] });
const rules = {
  store_id: [
    { required: true, message: "Chọn chi nhánh nhận", trigger: "change" },
  ],
};
const formTotal = computed(() =>
  form.items.reduce((s, i) => s + (i.quantity || 0) * (i.unit_cost || 0), 0),
);

const openCreateDialog = () => {
  form.store_id = stores.value[0]?.id || "";
  form.notes = "";
  form.items = [{ variant_id: 1, quantity: 1, unit_cost: 0 }];
  createVisible.value = true;
  createFormRef.value?.clearValidate?.();
};

const addItem = () => {
  form.items.push({ variant_id: 1, quantity: 1, unit_cost: 0 });
};
const removeItem = (idx) => {
  form.items.splice(idx, 1);
};

const submitCreate = () => {
  createFormRef.value.validate(async (valid) => {
    if (!valid) return;
    if (form.items.length === 0) {
      ElMessage.warning("Thêm ít nhất một sản phẩm");
      return;
    }
    creating.value = true;
    try {
      const payload = {
        store_id: form.store_id,
        items: form.items.map((i) => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
          unit_cost: i.unit_cost,
        })),
        notes: form.notes || "",
      };
      const result = await inventoryService.receiveInventory(payload);
      ElNotification({
        title: "Nhập kho thành công",
        message: result.message || "Đã nhập kho",
        type: "success",
      });
      createVisible.value = false;
      currentPage.value = 1;
      fetchTransactions();
    } catch (error) {
      console.error("Error receiving inventory:", error);
      ElMessage.error(error.response?.data?.message || "Không thể nhập kho");
    } finally {
      creating.value = false;
    }
  });
};
</script>

<style scoped>
/* ========= COMMON / LAYOUT ========= */
.page-container {
  padding: 16px;
  background: #f9fafb;
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
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.total-amount {
  font-weight: 700;
}

/* ========= TABS ========= */
.order-tabs {
  margin-bottom: 1px;
}
.order-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}
.table-container {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

/* ========= FILTER BAR ========= */
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.search-input-wrapper {
  flex: 1;
  min-width: 260px;
}
.advanced-filters {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  align-items: center;
  gap: 12px;
}
.adv-select {
  width: 220px;
}
.adv-date {
  width: 260px;
}

/* ========= TABLE ========= */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
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
  background: #f9fafb !important;
  color: #6b7280;
  font-weight: 600;
}
.page-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #f3f4f6;
  padding: 14px 0;
}
.page-container :deep(.el-table .el-table__row:hover > td) {
  background: #f9fafb !important;
}

/* ========= MOBILE CARD ========= */
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
.mobile-card .card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.card-title {
  color: #111827;
  font-weight: 600;
  line-height: 1.25;
  word-break: break-word;
}
.card-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 400;
}
.mobile-card .card-header :deep(.el-tag) {
  line-height: 20px;
  height: 22px;
  padding: 0 6px;
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
  gap: 8px;
}
.card-label {
  min-width: 40%;
  color: #6b7280;
  line-height: 1.25;
}
.card-label::after {
  content: ":";
  margin: 0 4px;
  color: #9ca3af;
}
.card-value {
  width: 60%;
  text-align: right;
  word-break: break-word;
}
.card-footer {
  padding: 8px 16px;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ========= DIALOGS (DETAIL/CREATE/IMPORT) ========= */
.detail-grid {
  display: grid;
  grid-template-columns: 160px 1fr;
  row-gap: 10px;
  column-gap: 12px;
  margin-bottom: 12px;
}
.drow {
  display: contents;
}
.dl {
  color: #6b7280;
}
.dv {
  color: #111827;
  font-weight: 500;
}
.sub-title {
  margin: 12px 0 8px;
  font-weight: 600;
  color: #111827;
}
.total-row {
  margin-top: 12px;
  text-align: right;
  font-size: 16px;
}
.create-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}
.table-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.table-actions .spacer {
  flex: 1;
}
.grand-total {
  font-weight: 600;
}
.import-uploader {
  margin-top: 20px;
}
.import-uploader :deep(.el-upload-dragger) {
  padding: 30px 20px;
}
.el-upload__tip {
  margin-top: 10px;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-upload__tip .el-button {
  margin-left: 5px;
}

/* ========= EMPTY STATE ========= */
.orders-empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}
.orders-empty-desc {
  font-size: 0.9rem;
  color: #6b7280;
  max-width: 460px;
  margin-top: 8px;
  margin-bottom: 20px;
  line-height: 1.5;
}

/* ========= MOBILE TWEAKS ========= */
@media (max-width: 767px) {
  .order-tabs :deep(.el-tabs__header) {
    padding: 0;
  }
  .order-tabs :deep(.el-tabs__nav) {
    width: 100%;
    display: flex;
  }
  .order-tabs :deep(.el-tabs__item) {
    flex: 1;
    text-align: center;
    padding: 0 6px;
    white-space: nowrap;
  }

  .filters-bar {
    gap: 8px;
  }
  .filters-bar .el-input {
    flex: 1;
    min-width: 0;
  }
  .advanced-filters {
    grid-auto-flow: row;
    grid-template-columns: 1fr;
  }

  /* Form & detail single column */
  .create-grid {
    grid-template-columns: 1fr !important;
  }
  .detail-grid {
    grid-template-columns: 1fr !important;
  }

  /* Force dialogs full-screen & comfortable paddings */
  :deep(.el-dialog) {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    height: 100% !important;
    display: flex;
    flex-direction: column;
  }
  :deep(.el-dialog__body) {
    flex: 1 1 auto;
    overflow: auto;
    padding: 12px !important;
  }
  :deep(.el-dialog__header),
  :deep(.el-dialog__footer) {
    padding: 10px 12px;
  }
}
</style>
