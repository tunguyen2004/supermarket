<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Chuyển kho</h1>
      <el-button type="primary" :icon="Plus" @click="openDrawer()">
        Tạo phiếu chuyển kho
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm mã giao dịch, sản phẩm..."
          clearable
          :prefix-icon="Search"
        />
        <el-select
          v-if="!isMobile"
          v-model="storeFilter"
          placeholder="Lọc chi nhánh"
          clearable
        >
          <el-option
            v-for="s in stores"
            :key="s.id"
            :label="s.name"
            :value="s.id"
          />
        </el-select>
        <el-date-picker
          v-if="!isMobile"
          v-model="dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="Từ"
          end-placeholder="Đến"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          style="max-width: 280px"
          clearable
        />
      </div>

      <!-- Desktop table -->
      <el-table
        v-if="!isMobile"
        :data="transactions"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column
          prop="transaction_code"
          label="Mã giao dịch"
          width="200"
        />
        <el-table-column label="Sản phẩm" min-width="200">
          <template #default="{ row }">
            <div>{{ row.product_name }}</div>
            <div style="font-size: 0.85em; color: #6b7280">{{ row.sku }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Loại" width="130" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.type_code === 'TRANSFER_OUT' ? 'danger' : 'success'"
              size="small"
              effect="light"
            >
              {{ row.type_code === "TRANSFER_OUT" ? "Xuất kho" : "Nhập kho" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="store_name" label="Chi nhánh" width="160" />
        <el-table-column prop="date_key" label="Ngày" width="120" />
        <el-table-column label="Số lượng" width="100" align="right">
          <template #default="{ row }">{{
            Math.abs(row.quantity_change)
          }}</template>
        </el-table-column>
        <el-table-column prop="created_by_name" label="Người tạo" width="130" />
        <el-table-column label="" width="80" align="center">
          <template #default="{ row }">
            <el-button
              size="small"
              :icon="View"
              text
              bg
              @click="openDetail(row)"
              >Xem</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- Mobile cards -->
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
              <span class="card-subtitle">{{ item.date_key }}</span>
            </div>
            <el-tag
              :type="item.type_code === 'TRANSFER_OUT' ? 'danger' : 'success'"
              size="small"
              effect="light"
            >
              {{ item.type_code === "TRANSFER_OUT" ? "Xuất" : "Nhập" }}
            </el-tag>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Sản phẩm</span>
              <span class="card-value">{{ item.product_name }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Chi nhánh</span>
              <span class="card-value">{{ item.store_name }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Số lượng</span>
              <span class="card-value">{{
                Math.abs(item.quantity_change)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && transactions.length === 0"
        description="Chưa có giao dịch chuyển kho nào"
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

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailVisible"
      title="Chi tiết giao dịch chuyển kho"
      width="500px"
      destroy-on-close
    >
      <template v-if="selectedTx">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="Mã giao dịch">{{
            selectedTx.transaction_code
          }}</el-descriptions-item>
          <el-descriptions-item label="Loại">
            <el-tag
              :type="
                selectedTx.type_code === 'TRANSFER_OUT' ? 'danger' : 'success'
              "
              size="small"
            >
              {{
                selectedTx.type_code === "TRANSFER_OUT"
                  ? "Chuyển đi (OUT)"
                  : "Nhận về (IN)"
              }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Sản phẩm"
            >{{ selectedTx.product_name }} ({{
              selectedTx.sku
            }})</el-descriptions-item
          >
          <el-descriptions-item label="Chi nhánh">{{
            selectedTx.store_name
          }}</el-descriptions-item>
          <el-descriptions-item label="Ngày">{{
            selectedTx.date_key
          }}</el-descriptions-item>
          <el-descriptions-item label="Số lượng">{{
            Math.abs(selectedTx.quantity_change)
          }}</el-descriptions-item>
          <el-descriptions-item label="Tồn trước">{{
            selectedTx.balance_before
          }}</el-descriptions-item>
          <el-descriptions-item label="Tồn sau">{{
            selectedTx.balance_after
          }}</el-descriptions-item>
          <el-descriptions-item label="Người tạo">{{
            selectedTx.created_by_name || "—"
          }}</el-descriptions-item>
          <el-descriptions-item label="Ghi chú">{{
            selectedTx.notes || "—"
          }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <!-- Create Drawer -->
    <el-drawer
      v-model="drawerVisible"
      title="Tạo phiếu chuyển kho"
      direction="rtl"
      size="60%"
    >
      <div class="drawer-content">
        <el-form
          :model="form"
          :rules="formRules"
          ref="formRef"
          label-position="top"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Kho gửi (Xuất)" prop="from_store_id">
                <el-select
                  v-model="form.from_store_id"
                  placeholder="Chọn kho gửi"
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
            </el-col>
            <el-col :span="12">
              <el-form-item label="Kho nhận (Nhập)" prop="to_store_id">
                <el-select
                  v-model="form.to_store_id"
                  placeholder="Chọn kho nhận"
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
            </el-col>
          </el-row>
          <el-form-item label="Ghi chú">
            <el-input v-model="form.notes" type="textarea" :rows="2" />
          </el-form-item>
          <el-divider />
          <div class="product-section-header">
            <p><strong>Danh sách sản phẩm chuyển kho</strong></p>
            <el-button @click="addItem">Thêm sản phẩm</el-button>
          </div>
          <el-table
            :data="form.items"
            size="small"
            border
            class="product-table"
          >
            <el-table-column label="Variant ID" width="130">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.variant_id"
                  :min="1"
                  size="small"
                  controls-position="right"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="Số lượng" width="130">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  size="small"
                  controls-position="right"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="" width="60" align="center">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  plain
                  @click="removeItem($index)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </div>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">Hủy</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSave"
            >Chuyển kho</el-button
          >
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";
import { Search, Plus, View, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElNotification } from "element-plus";
import inventoryService from "@/services/inventoryService";

// Responsive
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

// State
const isLoading = ref(false);
const search = ref("");
const storeFilter = ref("");
const dateRange = ref("");
const currentPage = ref(1);
const pageSize = 20;
const totalItems = ref(0);
const transactions = ref([]);
const stores = ref([]);

// Fetch
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
  const params = {
    type: "TRANSFER_OUT,TRANSFER_IN",
    page: currentPage.value,
    limit: pageSize,
  };
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

// Detail
const detailVisible = ref(false);
const selectedTx = ref(null);
const openDetail = (row) => {
  selectedTx.value = row;
  detailVisible.value = true;
};

// Create drawer
const drawerVisible = ref(false);
const formRef = ref();
const submitting = ref(false);
const form = reactive({
  from_store_id: "",
  to_store_id: "",
  notes: "",
  items: [],
});
const formRules = {
  from_store_id: [
    { required: true, message: "Chọn kho gửi", trigger: "change" },
  ],
  to_store_id: [
    { required: true, message: "Chọn kho nhận", trigger: "change" },
  ],
};

const openDrawer = () => {
  form.from_store_id = stores.value[0]?.id || "";
  form.to_store_id = stores.value[1]?.id || stores.value[0]?.id || "";
  form.notes = "";
  form.items = [{ variant_id: 1, quantity: 1 }];
  drawerVisible.value = true;
  formRef.value?.clearValidate?.();
};

const addItem = () => {
  form.items.push({ variant_id: 1, quantity: 1 });
};
const removeItem = (i) => {
  form.items.splice(i, 1);
};

const handleSave = async () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    if (form.from_store_id === form.to_store_id) {
      ElMessage.warning("Kho gửi và kho nhận không được trùng nhau");
      return;
    }
    if (form.items.length === 0) {
      ElMessage.warning("Thêm ít nhất một sản phẩm");
      return;
    }
    submitting.value = true;
    try {
      const payload = {
        from_store_id: form.from_store_id,
        to_store_id: form.to_store_id,
        items: form.items.map((i) => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
        notes: form.notes || "",
      };
      const result = await inventoryService.transferInventory(payload);
      ElNotification({
        title: "Chuyển kho thành công",
        message: result.message || "Đã chuyển kho",
        type: "success",
      });
      drawerVisible.value = false;
      currentPage.value = 1;
      fetchTransactions();
    } catch (error) {
      console.error("Error transferring:", error);
      ElMessage.error(error.response?.data?.message || "Không thể chuyển kho");
    } finally {
      submitting.value = false;
    }
  });
};
</script>
<style scoped>
/* ===== Layout cơ bản ===== */
:root {
  --sidebar-offset: 260px;
} /* nếu sidebar của bạn có biến offset */
.page-container {
  margin-left: var(--sidebar-offset); /* bỏ nếu bạn không dùng biến offset */
  padding: 16px;
  background: #f9fafb;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

/* Tabs */
.order-tabs {
  margin-bottom: 1px;
}
.order-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}
.order-tabs :deep(.el-tabs__item) {
  font-weight: 600;
}

/* Container + filters */
.table-container {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}
.filters-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.page-container :deep(.el-input__wrapper),
.page-container :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}

/* Table (desktop) */
.page-container :deep(.el-table th) {
  background: #f9fafb !important;
  color: #6b7280;
  font-weight: 700;
}
.page-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}
.page-container :deep(.el-table .el-table__row:hover > td) {
  background: #fafafa !important;
}

/* Route cell (desktop & mobile) */
.route-cell,
.route-cell-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
}
.route-cell {
  font-weight: 600;
}
.route-cell-mobile {
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

/* Nút thao tác trong bảng */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.page-container :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ===== Mobile cards ===== */
.mobile-card-list {
  padding: 12px;
}
.mobile-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.card-header {
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.card-title {
  font-weight: 800;
  color: #111827;
}
.card-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}
.card-body {
  padding: 12px 14px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
}
.card-label {
  color: #6b7280;
}
.card-value {
  color: #111827;
  font-weight: 600;
}

/* ===== Drawer (Element Plus trong style scoped) ===== */
:deep(.el-drawer__body) {
  display: flex;
  flex-direction: column;
}
.drawer-content {
  flex: 1 1 auto;
  overflow-y: auto;
  padding-right: 8px;
}
.drawer-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
.product-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
/* ===== Responsive ===== */
@media (min-width: 1024px) {
  .page-container {
    padding: 24px 32px;
  }
  .page-title {
    font-size: 1.8rem;
  }
  .filters-bar {
    padding: 16px 20px;
  }
}

@media (max-width: 900px) {
  /* nếu sidebar là off-canvas trên mobile, bỏ margin-left */
  .page-container {
    margin-left: 0;
  }
}

@media (max-width: 767px) {
  /* Tabs gọn trên mobile */
  .order-tabs :deep(.el-tabs__header) {
    padding: 0 8px;
  }
  .order-tabs :deep(.el-tabs__nav) {
    display: flex;
    width: 100%;
    overflow-x: auto;
  }
  .order-tabs :deep(.el-tabs__item) {
    flex: 1;
    text-align: center;
    padding: 0 6px;
  }
  /* Drawer rộng hơn trên mobile */
  :deep(.el-drawer) {
    width: 92% !important;
  }
}
</style>
