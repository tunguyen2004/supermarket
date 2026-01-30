<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Tồn kho sản phẩm</h1>
      <div class="action-buttons-group">
        <el-button :icon="SwitchIcon" @click="openTransferDialog"
          >Chuyển kho</el-button
        >
        <el-button type="primary" :icon="Plus" @click="openReceiveDialog"
          >Nhập kho</el-button
        >
      </div>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="search"
            placeholder="Tìm theo mã, tên sản phẩm..."
            clearable
            :prefix-icon="Search"
          />
        </div>
        <div v-if="!isMobile" class="advanced-filters">
          <el-select
            v-model="locationFilter"
            placeholder="Vị trí kho"
            clearable
            class="adv-select"
          >
            <el-option
              v-for="loc in uniqueLocations"
              :key="loc"
              :label="loc"
              :value="loc"
            />
          </el-select>
          <el-select
            v-model="statusFilter"
            placeholder="Trạng thái"
            clearable
            class="adv-select"
          >
            <el-option
              v-for="s in statusOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </div>
      </div>

      <!-- DESKTOP TABLE -->
      <el-table
        v-if="!isMobile"
        :data="pagedInventories"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column label="Sản phẩm" min-width="360">
          <template #default="scope">
            <div class="product-info">
              <el-image
                class="product-image"
                :src="scope.row.imageUrl"
                fit="cover"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div>
                <div class="product-name">{{ scope.row.name }}</div>
                <div class="product-code">Mã SP: {{ scope.row.code }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="Vị trí kho" width="180" />
        <el-table-column label="Tồn kho" width="160" sortable align="center">
          <template #default="scope">
            <span class="stock-strong">{{ scope.row.stock }}</span>
            <span class="product-unit"> {{ scope.row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="160" align="center">
          <template #default="scope">
            <el-tag
              :type="getStockStatus(scope.row.stock).type"
              effect="light"
              size="small"
            >
              {{ getStockStatus(scope.row.stock).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="180" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="Edit"
                text
                bg
                @click="openEditDialog(scope.row)"
                >Sửa</el-button
              >
              <el-button
                size="small"
                :icon="View"
                text
                bg
                @click="openHistoryDialog(scope.row)"
                >Lịch sử</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- MOBILE LIST -->
      <div v-else class="mobile-card-list">
        <div
          v-for="item in pagedInventories"
          :key="item.code"
          class="mobile-card"
        >
          <div class="card-header product-info">
            <el-image class="product-image" :src="item.imageUrl" fit="cover">
              <template #error
                ><div class="image-slot">
                  <el-icon><Picture /></el-icon></div
              ></template>
            </el-image>
            <div>
              <span class="card-title">{{ item.name }}</span>
              <div class="product-code">Mã SP: {{ item.code }}</div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Tồn kho</span>
              <span class="card-value"
                ><span class="stock-strong">{{ item.stock }}</span
                ><span class="product-unit"> {{ item.unit }}</span></span
              >
            </div>
            <div class="card-row">
              <span class="card-label">Trạng thái</span>
              <span class="card-value"
                ><el-tag
                  :type="getStockStatus(item.stock).type"
                  effect="light"
                  size="small"
                  >{{ getStockStatus(item.stock).text }}</el-tag
                ></span
              >
            </div>
            <div class="card-row">
              <span class="card-label">Vị trí</span
              ><span class="card-value">{{ item.location }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="Edit"
              text
              bg
              @click="openEditDialog(item)"
              >Sửa</el-button
            >
            <el-button
              size="small"
              :icon="View"
              text
              bg
              @click="openHistoryDialog(item)"
              >Lịch sử</el-button
            >
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && pagedInventories.length === 0"
        description="Không có sản phẩm phù hợp"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="totalItems"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- DIALOG: NHẬP KHO -->
    <el-dialog v-model="receiveVisible" title="Nhập kho" width="520">
      <el-form :model="receiveForm" label-width="120px" class="dialog-form">
        <el-form-item label="Sản phẩm">
          <el-select v-model="receiveForm.code" placeholder="Chọn sản phẩm">
            <el-option
              v-for="p in inventories"
              :key="p.code"
              :label="`${p.name} · ${p.code}`"
              :value="p.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Số lượng nhập">
          <el-input-number v-model="receiveForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input
            v-model="receiveForm.note"
            placeholder="VD: nhập hàng từ NCC"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="receiveVisible = false">Huỷ</el-button>
        <el-button type="primary" @click="confirmReceive">Xác nhận</el-button>
      </template>
    </el-dialog>

    <!-- DIALOG: CHUYỂN KHO -->
    <el-dialog v-model="transferVisible" title="Chuyển kho" width="520">
      <el-form :model="transferForm" label-width="120px" class="dialog-form">
        <el-form-item label="Sản phẩm">
          <el-select v-model="transferForm.code" placeholder="Chọn sản phẩm">
            <el-option
              v-for="p in inventories"
              :key="p.code"
              :label="`${p.name} · ${p.code}`"
              :value="p.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Kho hiện tại">
          <el-input
            :model-value="selectedByCode(transferForm.code)?.location || ''"
            disabled
          />
        </el-form-item>
        <el-form-item label="Chuyển đến kho">
          <el-select v-model="transferForm.to" placeholder="Chọn kho">
            <el-option
              v-for="loc in uniqueLocations"
              :key="loc"
              :label="loc"
              :value="loc"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input
            v-model="transferForm.note"
            placeholder="VD: điều chuyển nội bộ"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible = false">Huỷ</el-button>
        <el-button type="primary" @click="confirmTransfer">Xác nhận</el-button>
      </template>
    </el-dialog>

    <!-- DIALOG: SỬA SẢN PHẨM TRONG KHO -->
    <el-dialog v-model="editVisible" title="Sửa tồn kho" width="600">
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="130px"
        class="dialog-form two-cols"
      >
        <el-form-item label="Mã sản phẩm">
          <el-input v-model="editForm.code" disabled />
        </el-form-item>
        <el-form-item label="Tên sản phẩm">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="Đơn vị">
          <el-input v-model="editForm.unit" />
        </el-form-item>
        <el-form-item label="Ảnh (URL)">
          <el-input v-model="editForm.imageUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="Vị trí kho">
          <el-select v-model="editForm.location">
            <el-option
              v-for="loc in uniqueLocations"
              :key="loc"
              :label="loc"
              :value="loc"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Tồn kho hiện tại">
          <el-input-number v-model="editForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input
            v-model="editForm.note"
            placeholder="VD: chỉnh sửa thủ công"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">Huỷ</el-button>
        <el-button type="primary" @click="submitEdit">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- DIALOG: LỊCH SỬ -->
    <el-dialog
      v-model="historyVisible"
      :title="`Lịch sử · ${historyItem?.name || ''} (${
        historyItem?.code || ''
      })`"
      width="720"
    >
      <el-table :data="historyRows" style="width: 100%">
        <el-table-column prop="time" label="Thời gian" width="180" />
        <el-table-column prop="typeText" label="Loại" width="150" />
        <el-table-column prop="detail" label="Chi tiết" />
        <el-table-column prop="note" label="Ghi chú" width="200" />
      </el-table>
      <template #footer>
        <el-button @click="historyVisible = false">Đóng</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import {
  Search,
  Plus,
  Edit,
  View,
  Switch as SwitchIcon,
  Picture,
} from "@element-plus/icons-vue";
import inventoryService from "@/services/inventoryService";

// --- Responsive ---
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

// --- State ---
const isLoading = ref(false);
const search = ref("");
const locationFilter = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const stores = ref([]);

const statusOptions = [
  { value: "out", label: "Hết hàng" },
  { value: "low", label: "Sắp hết" },
  { value: "normal", label: "Bình thường" },
  { value: "high", label: "Dư thừa" },
];

// --- Data ---
const inventories = ref([]);

// Fetch inventories from API
const fetchInventories = async () => {
  try {
    isLoading.value = true;
    const storeId = locationFilter.value
      ? stores.value.find((s) => s.name === locationFilter.value)?.id
      : null;

    const params = {
      search: search.value,
      store_id: storeId,
      status: statusFilter.value,
      page: currentPage.value,
      limit: pageSize,
    };

    const result = await inventoryService.getInventories(params);
    inventories.value = result.data.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      unit: item.unit,
      stock: parseFloat(item.quantity_available || 0),
      location: item.location,
      store_id: item.store_id,
      sku: item.sku,
      barcode: item.barcode,
      stock_status: item.stock_status,
      imageUrl: item.image_url || "https://via.placeholder.com/80",
      history: [],
    }));
    totalItems.value = result.pagination?.total || 0;
  } catch (error) {
    console.error("Error fetching inventories:", error);
    ElMessage.error("Không thể tải danh sách tồn kho");
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  try {
    const storesRes = await inventoryService.getStores();
    stores.value = storesRes.data || [];
  } catch (error) {
    console.error("Error loading stores:", error);
  }
  fetchInventories();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// --- Utils ---
const now = () => new Date().toLocaleString("vi-VN");
const selectedByCode = (code) => inventories.value.find((i) => i.code === code);
const getStockStatus = (stock) => {
  if (stock === 0) return { type: "danger", text: "Hết hàng" };
  if (stock <= 20) return { type: "warning", text: "Sắp hết" };
  return { type: "success", text: "Còn hàng" };
};
const uniqueLocations = computed(() => stores.value.map((s) => s.name));

// Use server-side data directly
const filteredInventories = computed(() => inventories.value);
const pagedInventories = computed(() => inventories.value);

// reset page and fetch when filter changes
watch([search, locationFilter, statusFilter], () => {
  currentPage.value = 1;
  fetchInventories();
});

// fetch when page changes
watch(currentPage, () => {
  fetchInventories();
});

// --- Receive (Nhập kho) ---
const receiveVisible = ref(false);
const receiveForm = ref({ code: "", quantity: 1, note: "" });
const openReceiveDialog = () => {
  receiveForm.value = {
    code: inventories.value[0]?.code || "",
    quantity: 1,
    note: "",
  };
  receiveVisible.value = true;
};

const addHistory = (item, entry) => {
  item.history.unshift({ time: now(), ...entry });
};

const confirmReceive = async () => {
  const item = selectedByCode(receiveForm.value.code);
  if (!item) {
    ElMessage.error("Chưa chọn sản phẩm");
    return;
  }
  if (receiveForm.value.quantity <= 0) {
    ElMessage.error("Số lượng không hợp lệ");
    return;
  }
  isLoading.value = true;
  setTimeout(() => {
    item.stock += Number(receiveForm.value.quantity);
    addHistory(item, {
      type: "receive",
      typeText: "Nhập kho",
      detail: `+${receiveForm.value.quantity} ${item.unit}`,
      note: receiveForm.value.note || "",
    });
    ElNotification({
      title: "Đã nhập kho",
      message: `${item.name} +${receiveForm.value.quantity} ${item.unit}`,
      type: "success",
    });
    isLoading.value = false;
    receiveVisible.value = false;
  }, 400);
};

// --- Transfer (Chuyển kho) ---
const transferVisible = ref(false);
const transferForm = ref({ code: "", to: "", note: "" });
const openTransferDialog = () => {
  transferForm.value = {
    code: inventories.value[0]?.code || "",
    to: uniqueLocations.value[0] || "",
    note: "",
  };
  transferVisible.value = true;
};

const confirmTransfer = async () => {
  const item = selectedByCode(transferForm.value.code);
  if (!item) {
    ElMessage.error("Chưa chọn sản phẩm");
    return;
  }
  if (!transferForm.value.to) {
    ElMessage.error("Chưa chọn kho đích");
    return;
  }
  if (transferForm.value.to === item.location) {
    ElMessage.warning("Kho đích trùng kho hiện tại");
    return;
  }
  await ElMessageBox.confirm(
    `Chuyển "${item.name}" từ ${item.location} → ${transferForm.value.to}?`,
    "Xác nhận",
    { type: "warning" },
  ).catch(() => null);
  isLoading.value = true;
  setTimeout(() => {
    const from = item.location;
    item.location = transferForm.value.to;
    addHistory(item, {
      type: "transfer",
      typeText: "Chuyển kho",
      detail: `${from} → ${item.location}`,
      note: transferForm.value.note || "",
    });
    ElNotification({
      title: "Đã chuyển kho",
      message: `${item.name}: ${from} → ${item.location}`,
      type: "success",
    });
    isLoading.value = false;
    transferVisible.value = false;
  }, 400);
};

// --- Edit (Sửa) ---
const editVisible = ref(false);
const editFormRef = ref(null);
const editForm = ref({
  code: "",
  name: "",
  unit: "",
  imageUrl: "",
  location: "",
  stock: 0,
  note: "",
});

const openEditDialog = (row) => {
  editForm.value = {
    code: row.code,
    name: row.name,
    unit: row.unit,
    imageUrl: row.imageUrl,
    location: row.location,
    stock: row.stock,
    note: "",
  };
  editVisible.value = true;
};

const submitEdit = async () => {
  const item = selectedByCode(editForm.value.code);
  if (!item) return;
  const oldStock = item.stock;

  try {
    isLoading.value = true;
    const storeId = item.store_id || stores.value[0]?.id || 1;

    const payload = {
      store_id: storeId,
      quantity: editForm.value.stock,
      adjustment_type: "set",
      notes: editForm.value.note || "Chỉnh sửa tồn kho",
    };

    const result = await inventoryService.adjustInventory(item.id, payload);

    // Update local data
    item.name = editForm.value.name;
    item.unit = editForm.value.unit;
    item.imageUrl = editForm.value.imageUrl;
    item.location = editForm.value.location;
    item.stock = Number(editForm.value.stock);

    const delta = item.stock - oldStock;
    const deltaStr =
      delta === 0 ? "" : delta > 0 ? `(+${delta})` : `(${delta})`;
    addHistory(item, {
      type: "edit",
      typeText: "Điều chỉnh",
      detail: `Tồn kho: ${oldStock} → ${item.stock} ${deltaStr}; Vị trí: ${item.location}`,
      note: editForm.value.note || "",
    });

    ElMessage.success(result.message || "Đã lưu thay đổi");
    editVisible.value = false;
  } catch (error) {
    console.error("Error adjusting inventory:", error);
    ElMessage.error(
      error.response?.data?.message || "Không thể điều chỉnh tồn kho",
    );
  } finally {
    isLoading.value = false;
  }
};

// --- History (Lịch sử) ---
const historyVisible = ref(false);
const historyItem = ref(null);
const openHistoryDialog = (row) => {
  historyItem.value = row;
  historyVisible.value = true;
};
const historyRows = computed(() => historyItem.value?.history || []);
</script>

<style scoped>
/* layout helpers */
.action-buttons-group {
  display: flex;
  gap: 8px;
}
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
  width: 200px;
}

/* product visuals */
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.product-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid #f3f4f6;
}
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}
.product-name {
  font-weight: 600;
  color: #111827;
}
.product-code {
  font-size: 0.8rem;
  color: #6b7280;
}
.product-unit {
  color: #6b7280;
  font-size: 0.9em;
  font-weight: 400;
}
.stock-strong {
  font-weight: 600;
}

/* page shell */
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
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* mobile cards */
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
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* dialog forms */
.dialog-form.two-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 12px 16px;
}
@media (max-width: 768px) {
  .advanced-filters {
    grid-auto-flow: row;
    grid-template-columns: 1fr;
  }
  .dialog-form.two-cols {
    grid-template-columns: 1fr;
  }
}

/* element-plus tweaks */
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
</style>
